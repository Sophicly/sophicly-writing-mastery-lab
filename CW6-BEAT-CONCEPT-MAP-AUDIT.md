# CW Step-6 — beat → concept audit, FULL RESULTS

2026-08-03. Five Opus subagents, every one of the **242** distinct (beat label → concept) pairs judged.
Trigger: Neil tapped [Examples] on rebirth-redemption's *"Protagonist presented with unlikeable, inhumane
qualities"* and got the **False Identity** panel.

## Headline

| verdict | count | share |
|---|---|---|
| ✅ correct | 152 | 63% |
| ⚠️ weak (related, but not what the beat asks) | 36 | 15% |
| ❌ wrong (a student is taught a different beat) | 54 | 22% |

**88 of 242 pairs (36%) are not right.** Those 242 pairs cover all 881 beat rows across the eight archetypes.

## Root cause

`_cw6ConceptFor(label, prompt)` (wml-assessment.js:45297) is **archetype-blind** — it sees only the beat's
label and prompt, never which plot structure the student picked. So a shared concept can claim a beat that
belongs to one archetype only, and regex branches get bolted on to force matches. Nothing errors; a wrong
concept looks exactly like a right one.

## Worst over-claiming concepts

| mis-mapped rows | concept |
|---|---|
| 8 | `(matched nothing)` |
| 8 | `nick-of-time` |
| 5 | `mentor` |
| 4 | `nightmare-battle` |
| 4 | `oppression` |
| 4 | `world-deteriorates` |
| 4 | `false-identity` |
| 4 | `surpasses-mentor` |
| 4 | `fatal-blow` |
| 4 | `approach` |
| 4 | `lowest-point` |
| 3 | `guidance` |
| 3 | `epiphany` |
| 2 | `dark-force-rising` |
| 2 | `underworld` |
| 2 | `balance-restored` |
| 2 | `ordinary-world` |
| 2 | `threshold` |
| 2 | `allies-disagree` |
| 2 | `obstacles` |
| 1 | `balance-deteriorates` |
| 1 | `seizes-sword` |
| 1 | `allies` |
| 1 | `monster-distant` |
| 1 | `self-sacrifice` |
| 1 | `villain-accuses` |
| 1 | `mood-turns` |
| 1 | `physical-attack` |
| 1 | `shadow-dominates` |
| 1 | `the-flaw` |
| 1 | `call-to-adventure` |
| 1 | `figurative-death` |
| 1 | `powerless` |
| 1 | `the-sword` |
| 1 | `tragic-acceptance` |
| 1 | `villain-weakness` |
| 1 | `opening-image` |

## ❌ WRONG — the student is taught a different beat (54)

| beat | archetypes | now maps to | should be | why it is wrong |
|---|---|---|---|---|
| Mentor informs of consequences if they do not change | rebirth-redemption | `dark-force-rising` | `figurative-death` | the beat is the mentor naming what he loses by staying the same, not the opposition widening its reach |
| Something reminds protagonist of need to change | rebirth-redemption | `dark-force-rising` | `epiphany` | the beat is an inner click triggered by something he sees; the concept teaches the opposition growing |
| May contact spirits who give strange or mistaken guidance | tragedy | `guidance` | `prophecy` | misleading supernatural promises are prophecy's subject, and its criteria teach the double edge this beat needs |
| Dark figures mistreat the protagonist | rags-to-riches | `oppression` | `problem-snapshot` | the concept teaches pressure on everyone AROUND the protagonist; this beat is his own mistreatment |
| Hero seeks harmful gratification; community suffers | rebirth-redemption | `oppression` | `gratification` | here the protagonist IS the cause of the suffering; the concept teaches an outside force pressing on the community |
| He encounters inner demons and temptations | rebirth-redemption | `underworld` | `powerless` | the beat is inner vacillation between two selves; the concept teaches a physical dark setting |
| Hero has increased awareness of need to change | rags-to-riches | `world-deteriorates` | `epiphany` | the beat is his growing recognition, not the world visibly worsening |
| Protagonist has increased awareness of dangers ahead | the-quest | `world-deteriorates` | `monster-distant` | the beat is what he learns about the threat ahead, not a world getting worse |
| Protagonist has increased awareness of the monster | overcoming-the-monster | `world-deteriorates` | `monster-distant` | the beat is the threat becoming known before it is ever seen, not the world worsening |
| Protagonist sees more signs why he needs to change | rebirth-redemption | `world-deteriorates` | `warning-ignored` | at this stage he sees the signs and still does nothing; the concept says nothing about ignoring them |
| Hero appears whole for all the future | overcoming-the-monster, the-quest | `balance-restored` | `how-much-learnt` | Beat is the protagonist made permanently whole; the concept explicitly teaches the WORLD after, 'not just your protagonist' — the opposite emphasis. |
| Protagonist presented with admirable, desirable qualities | tragedy | `false-identity` | `NEW:admirable-first` | No mask here at all — the beat makes the audience love him SO THE FALL HURTS. Bolted onto the false-identity regex to force a match (mirror of the proven rebirth-redemption defect). Proposed: admirable-first — 'Admirable First (Set Up the Fall)'. |
| Protagonist presented with unlikeable, inhumane qualities | rebirth-redemption | `false-identity` | `NEW:unlikeable-first` | The known live defect: no mask, no pretence — he is made repellent so the later change is worth something. Proposed: unlikeable-first — 'Unlikeable First (Set Up the Redemption)'. |
| Protagonist receives a warning; threat becomes visible | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | `monster-distant` | `warning-ignored` | Concept teaches WITHHOLDING the threat ('the less you show, the larger it feels') — the exact opposite of a beat where the threat becomes visible and a warning is delivered. |
| DREAM STAGE - THE SPECIAL WORLD - THE JOURNEY | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `— nothing —` | `special-world` | This is a stage BANNER, not a beat — it currently offers no examples and no chips. Either drop it from the beat rows or map it to special-world. |
| HIGHER STAKES | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `— nothing —` | `obstacles` | Matches nothing, so no help at all on a row whose job is escalation; obstacles teaches exactly that ('each obstacle harder than the last'). |
| TURNING POINT #1: Opportunity | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `— nothing —` | `call-to-adventure` | Unmatched. This is the inciting event that arrives from outside — call-to-adventure is written for it. |
| TURNING POINT #2: Change of Plans | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `— nothing —` | `sees-way-to-fix` | Unmatched. The student must write the new plan — sees-way-to-fix teaches 'a decision plus an action, too simple to work'. |
| TURNING POINT #3: Point of No Return | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `— nothing —` | `threshold` | Unmatched. threshold is the point-of-no-return concept ('once across, going back is not simple'). |
| TURNING POINT #4: Major Setback | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `— nothing —` | `lowest-point` | Unmatched. 'Major setback' is the all-is-lost beat lowest-point describes. |
| TURNING POINT #5: Climax | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `— nothing —` | `fatal-blow` | Unmatched. fatal-blow is the climax concept — but note it insists the protagonist must be the one who acts, which is false in tragedy, where the decisive act is usually done TO them. |
| TURNING POINT: Anticipation | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `— nothing —` | `storm-coming` | Unmatched. Sits in Stage I; the job is unease before any event, which is exactly storm-coming ('atmosphere, not event'). |
| Protagonist in state of youthful naivety, lacking responsibility | coming-of-age | `ordinary-world` | `limited-awareness` | The prompt opens with the words 'has limited awareness'. limited-awareness teaches it AND fixes the row's own failing — 'show it through a mistake or an assumption, never by telling us they are naive'. ordinary-world is a separate beat this archetype already has. |
| Protagonist refuses again; stuck in ordinary world | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `ordinary-world` | `refusal` | The beat is a SECOND refusal; ordinary-world teaches establishing normal life in Act 1. refusal teaches the move, including the action ('they go back, put it down, close the door'). |
| Protagonist decides to die with honour and glory | tragedy | `self-sacrifice` | `tragic-acceptance` | self-sacrifice teaches surrender as 'the proof of the change' — but in tragedy dying for honour is the FLAW carried to the end, not growth. The concept would have a student write a redemptive scene into a tragedy. |
| Small group of allies may welcome the protagonist | rebirth-redemption | `threshold` | `allies` | Matched on the words 'into the special world' only. The beat is about WHO welcomes him; threshold teaches the physical crossing and gives no help designing the group. |
| Small group of allies welcomes the Hero | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | `threshold` | `allies` | Same false match on 'into the special world'. Also note the archetype split: in tragedy this welcoming group flatters and enables rather than supports — a divergence that argues for a tragedy-specific row. |
| Protagonist accuses opponents; opponent does not listen | tragedy | `villain-accuses` | `NEW:accusation-unheard` | The roles are INVERTED: the protagonist accuses and is ignored, and it fails. The concept teaches the antagonist accusing and the hero answering with an action — a student would write the wrong scene entirely. Proposed: accusation-unheard — 'The Accusation Nobody Hears'. |
| Hero becomes separated from what's important | rags-to-riches, the-quest | `allies-disagree` | `NEW:separation-from-what-matters` | Concept teaches a GROUP splitting; this beat is losing the person, place or thing that had become the anchor — if the student's 'important thing' is not an ally, the concept gives them nothing. Job also differs between the two archetypes. |
| THIRD EPIPHANY: enlightened, possibly via redemption figure | rebirth-redemption | `epiphany` | `NEW:final-realisation` | The concept's criterion 'they need not understand ALL of it yet' directly CONTRADICTS the beat ('they fully understand the truth they could not see when they set out'). The example (Scrooge asking about Tiny Tim) is a first-epiphany example. The 'redemption figure' delivering the truth is untaught. |
| THIRD EPIPHANY: protagonist becomes enlightened | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | `epiphany` | `NEW:final-realisation` | Same contradiction as the other third epiphany — the concept tells the student to hold back full understanding when the beat requires it. Worse: this row spans tragedy, where the beat is the too-late recognition and the correct concept is tragic-acceptance ('sees the truth too late — and goes on anyway'), a genuinely different job. |
| Allies pull out their own bag of tricks | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | `fatal-blow` | `NEW:allies-pay-off` | The concept insists 'your protagonist must be the one who does it' — the beat is the ALLIES acting. The student is told the opposite of what the beat asks. The real teaching is the pay-off of the distinct skill each ally was introduced with. |
| Dark forces accuse protagonist of being the same; not fooled | rags-to-riches | `fatal-blow` | `villain-accuses` | There is an exact concept already — villain-accuses ('You Are the Same as Me': the claim should be PARTLY TRUE, and the answer is an action not an argument). The regex branch 'final attempt' stole this row for fatal-blow, which teaches the decisive killing act instead. |
| Hero emerges to win the prize | overcoming-the-monster, the-quest | `fatal-blow` | `NEW:the-prize-won` | Stage VI aftermath beat — CLAIMING the prize, not striking the blow. fatal-blow would have the student rewrite the previous beat. What is needed: the prize must be the thing set up at the start, and be shown being taken. |
| Monster attacks the protagonist in final attempt | overcoming-the-monster | `fatal-blow` | `nightmare-battle` | The beat is the MONSTER attacking; the concept teaches the protagonist's own decisive act ('your protagonist must be the one who does it'). nightmare-battle is the right home — the external danger forcing the internal choice in one event. |
| Attacked again; resistance does not work | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | `physical-attack` | `obstacles` | The concept is literally 'The First Attack' and teaches 'the opposition touches them for the FIRST time' — this beat is explicitly 'attacked AGAIN'. The student is handed the wrong occasion. Also untaught: they lose because they cannot yet use the elixir they were given. |
| A shadowy figure may appear | tragedy | `shadow-dominates` | `monster-distant` | The concept teaches total domination ('the opposition is now the STRONGEST thing in your story'); this beat is a single glimpse of something that 'may' appear. monster-distant's teaching — withhold the thing itself, the less you show the larger it feels — is exactly the help a portent needs. |
| Hero makes preparations to defend winnings | tragedy | `approach` | `NEW:defending-the-prize` | Swept in by the bare word 'preparations'. Approach teaches moving TOWARD a goal; this tragedy beat is protecting a prize already taken, where each act of protection is a fresh crime. Proposed: 'defending-the-prize' — Defending the Prize. |
| Protagonist makes preparations to change | rebirth-redemption | `approach` | `sees-way-to-fix` | Same 'preparations' regex sweep. There is no external goal in sight here — the preparation is internal and rebirth-only. 'A Way to Fix It' (a decision plus an action, first plan, too simple to work) is exactly this beat. |
| Protagonist experimenting and learning from tests | overcoming-the-monster | `obstacles` | `NEW:tests-and-learning` | Obstacles teaches escalation of difficulty; this beat is the hero LEARNING from tests, allies and enemies — acquiring the skill and knowledge that makes the later win credible. Nothing in the 70 covers it. Proposed: 'tests-and-learning' — Tests, Allies and Enemies. |
| The hero seems tiny and alone | overcoming-the-monster | `powerless` | `shadow-dominates` | Overcoming-the-monster, Stage IV: nothing to do with a false identity or a mask. The beat is scale and isolation against a monster at its strongest — The Shadow Dominates ('show its reach; one image of the world under it') is the concept. |
| Protagonist receives apparent wisdom and ambiguous gifts | tragedy | `the-sword` | `prophecy` | The word 'apparent' and 'ambiguous' is the whole beat — a tragedy gift that is double-edged and misleads him. The Gift teaches an object that MEANS the change; it says nothing about a promise that comes true in a way he never meant. Prophecy teaches exactly that. |
| Forces of opposition and fate closing in | tragedy | `tragic-acceptance` | `cornered` | Tragic Acceptance is about recognition — seeing the truth too late and going on. This beat is external pressure tightening, before any recognition. Cornered ('close every exit; name the cost of losing') is the job. |
| Opponent understands the protagonist's weakness | tragedy | `villain-weakness` | `NEW:flaw-exploited` | The mapping is the beat REVERSED — the concept teaches the protagonist working out the ANTAGONIST's flaw, while this tragedy beat is the opponent working out the PROTAGONIST's. The Lion King example coaches the opposite move. Proposed: 'flaw-exploited' — The Flaw Turned Against Them (fallback: the-flaw). |
| Compelled to commit dark acts | tragedy | `lowest-point` | `NEW:dark-acts-escalate` | lowest-point teaches despair and being stripped bare; this beat is the protagonist ACTING — committing worse deeds to protect the first one. The branch 'compelled to commit dark acts' was bolted onto the regex. |
| Dark forces are dealt a fatal blow | rags-to-riches | `nick-of-time` | `fatal-blow` | nick-of-time teaches only the TIMING; the beat's job is the decisive act itself, and fatal-blow ('your protagonist must be the one who does it') is the lesson this beat needs — its regex already contains 'fatal blow' but nick-of-time claims the row first. |
| Dark forces dealt a fatal blow; goal is won | the-quest | `nick-of-time` | `fatal-blow` | same over-claim: fatal-blow's regex matches both 'fatal blow' and 'goal is won', and it teaches the decisive act; nick-of-time teaches only pace. |
| In the nick of time, the protagonist changes | rebirth-redemption | `nick-of-time` | `seizes-sword` | the beat is the REDEMPTION TURN, not an escape; nick-of-time teaches escape timing and short sentences, which gives a rebirth student nothing. seizes-sword teaches the mask coming off visibly. |
| Monster is dealt a fatal blow | overcoming-the-monster | `nick-of-time` | `fatal-blow` | the beat is the kill, not the clock; fatal-blow teaches that the protagonist must land it on the page rather than have it summarised. |
| More obstacles, crises and conflicts; thrilling escape | overcoming-the-monster | `nick-of-time` | `obstacles` | this sits at STAGE III (escalation), not the finale — nick-of-time claimed it on the words 'thrilling escape'. The beat's job is rising obstacles, which is exactly what the obstacles concept teaches. |
| Obstacles, betrayal, crises and conflicts | coming-of-age | `nick-of-time` | `obstacles` | STAGE III escalation beat mis-claimed by 'thrilling escape'; obstacles teaches escalation, and the betrayal clause is served by the betrayal concept, not by escape timing. |
| Obstacles, crises and conflicts ending in thrilling escape | heros-journey, rags-to-riches, the-quest, voyage-and-return | `nick-of-time` | `obstacles` | same STAGE III mis-claim: the row is about mounting obstacles, and nick-of-time only teaches the last-second win. |
| Protagonist struggles to escape | tragedy | `nick-of-time` | `NEW:futile-struggle` | archetype-blind mis-claim, and it teaches the OPPOSITE of the beat: nick-of-time promises the win 'lands with nothing to spare', but this is tragedy — the struggle must fail. A tragedy student is being told to write a rescue. |
| Final Image: opposite of Opening Image | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `opening-image` | `final-image` | the /opening image/i regex claims the row because the label contains the words; the final-image concept exists and teaches exactly this beat (mirror the opening, changed, show don't explain). |

## ⚠️ WEAK — related, but missing what the beat actually asks (36)

| beat | archetypes | now maps to | should be | why it is wrong |
|---|---|---|---|---|
| Tension begins to rise | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `balance-deteriorates` | `storm-coming` | the previous beat already uses this concept; rising tension is atmosphere, not the one thing that broke |
| Dark Mentor has faith protagonist will overcome | tragedy | `guidance` | `NEW:dark-mentor-faith` | in tragedy this encouragement pushes him toward ruin; the concept teaches a warm, helpful conversation and misses that inversion |
| Someone shows him the consequences of his actions | rebirth-redemption | `guidance` | `figurative-death` | the beat needs the consequence shown concretely; the concept teaches a quiet conversation and models nothing shown |
| Dark Herald guides protagonist to meet the Dark Mentor | tragedy | `mentor` | `herald` | three consecutive tragedy beats all resolve to mentor; this one belongs to the Herald, and herald exists |
| Herald guides protagonist to meet the Mentor | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | `mentor` | `herald` | the beat's subject is the messenger who brings him, not the mentor he meets two beats later |
| Mentor warns about going against their advice | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `mentor` | `warning-ignored` | the beat is the warning itself; the concept re-teaches who the mentor is, which the student has already written |
| Protagonist meets the Dark Mentor; overcoming fear | tragedy | `mentor` | `NEW:dark-mentor` | a Dark Mentor grants permission to do wrong; the concept's criteria and example teach the opposite kind of guide |
| The Dark Mentor awaits | tragedy | `mentor` | `NEW:dark-mentor` | duplicates the meeting beat under the same card, and a dark mentor's job inverts the concept's criteria |
| Face to face with the Monster and its awesome power | overcoming-the-monster | `nightmare-battle` | `shadow-dominates` | this beat reveals the monster's scale; the fight where the old self dies is a later beat already using this concept |
| Final nightmare battle approaches | heros-journey, coming-of-age, rags-to-riches, rebirth-redemption, voyage-and-return | `nightmare-battle` | `approach` | the beat is the run-up and preparation; the fight itself is a separate beat already using this concept |
| Final supreme battle approaches | the-quest | `nightmare-battle` | `approach` | the beat is the run-up and preparation; the fight itself is a separate beat already using this concept |
| Final supreme ordeal approaches | overcoming-the-monster | `nightmare-battle` | `approach` | the beat is the run-up and preparation; the fight itself is a separate beat already using this concept |
| Protagonist overshadowed by dark figures | rags-to-riches | `oppression` | `figurative-death` | the beat is what living in their shadow costs HIM; the concept points the student at everyone else |
| Protagonist overshadowed by oppressive life | heros-journey, coming-of-age, the-quest, voyage-and-return | `oppression` | `figurative-death` | the beat is what the oppressive life costs HIM; the concept points the student at everyone else |
| Protagonist seizes the sword; accepts new identity | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `seizes-sword` | `?` | in tragedy these same words mean committing to ruin, and the concept's liberation example teaches the opposite |
| Approach to the inmost cave | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | `underworld` | `approach` | this beat is the preparation to go down; the journey itself is a separate beat already using this concept |
| A random ally appears; will return later | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | `allies` | `foreshadow` | Concept teaches team design (each ally good at something you are not); the beat's whole point is that this ally LEAVES and returns at the worst moment — a plant-and-payoff the concept never mentions. |
| Hero emerges to win the prize; role in the Kingdom | rags-to-riches | `balance-restored` | `NEW:the-reward` | Beat is the protagonist's ELEVATION (station, recognition, prize); concept teaches community-after and says nothing about making the reward specific or unholdable by the old self. Proposed: the-reward — 'The Reward (Rise in Station)'. |
| Protagonist overwhelmed with despair; retreats to false identity | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | `false-identity` | `lowest-point` | Concept teaches ESTABLISHING the mask in Act 1; this is the despair-driven RELAPSE. lowest-point literally names it — 'the goal looks lost and the mask goes back on'. |
| Things out of control; retreats to false identity | tragedy | `false-identity` | `NEW:doubling-down` | In tragedy this retreat is not a temporary low but a refusal to change — he clings harder to the lie as things collapse. Concept teaches Act 1 mask-building only. Proposed: doubling-down — 'Doubling Down'. |
| Dark Mentor dies | tragedy | `surpasses-mentor` | `NEW:dark-mentor-falls` | Criterion 1 (mentor out of the way) fits, but criterion 2 — 'your protagonist then does the thing the mentor could not' — frames removal as triumph. A DARK mentor's death removes the last restraint and isolates him. Proposed: dark-mentor-falls — 'The Dark Mentor Falls'. |
| Dark Mentor fights the opposition and loses | tragedy | `surpasses-mentor` | `NEW:dark-mentor-falls` | Same as above — the concept's heroic framing does not fit a corrupter being defeated in a tragedy. |
| Hero surpasses the Dark Mentor | tragedy | `surpasses-mentor` | `?` | Shape fits, but the concept assumes a benign mentor and a heroic surpassing; in tragedy 'surpassing' means outdoing the corrupter in ruthlessness. Missing: a tragedy-side criterion. |
| Mentor sacrifices himself to save the protagonist | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | `surpasses-mentor` | `?` | Removal is covered, but a sacrifice's distinct job — leaving the hero a debt and grief to carry into the final fight — is not taught anywhere in the concept. |
| Obstacles, crises with those once close to | tragedy | `allies-disagree` | `?` | Concept teaches ONE split moment; the beat asks for SEVERAL escalating crises. Missing: escalation — each clash worse than the last (the 'obstacles' teaching) layered onto the relational break. |
| SECOND EPIPHANY: deeper realisation | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | `epiphany` | `?` | All three epiphanies share one concept, so it cannot ladder them. Missing here: this insight is about the SELF (not the world) and must change how they ACT — reactive to purposeful. The criteria still say 'a step, not the ending', which under-pitches it. |
| But things continue to go wrong | rebirth-redemption | `mood-turns` | `world-deteriorates` | 'Continue' means this is the second, deeper decline; mood-turns teaches a one-time shift in FEEL and tells the student to compare against an earlier scene they have already used. world-deteriorates ('measurably WORSE while your protagonist watches') carries the escalation this beat needs. |
| Main character's flaw revealed (may be another character's flaw) | rebirth-redemption | `the-flaw` | `?` | The beat's distinctive rebirth mechanic — the flaw may belong to ANOTHER central character whom the protagonist must arc — is entirely untaught. The concept assumes the flaw is the protagonist's, so a student choosing the displaced version gets no help deciding whose flaw drives the story. |
| Goal becomes much more specific | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | `approach` | `object-of-desire` | Beat sits in Stage III where the goal merely sharpens; the concept's 'last stretch is the worst / preparations before going in' half is a Stage V approach and misleads here. |
| Hero becomes committed to his course of action | tragedy | `approach` | `threshold` | Beat is the point of no return, not sighting a goal; only the concept's 'what they decide or give up' line touches it. Threshold teaches the irreversible crossing this beat needs. |
| Given supernatural or visionary direction; ONLY HE/SHE can solve it | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | `call-to-adventure` | `prophecy` | The generic Call is already covered by the 'INCITING INCIDENT' row in the same stage; what is distinctive here — a visionary/prophetic message and the chosen-one claim — is what Prophecy teaches (believed, incomplete or double-edged). |
| Protagonist sees life as oppressive, even though has a lot | tragedy | `figurative-death` | `false-balance` | Beat is about restless appetite despite plenty — the discontent that feeds the tragic ambition. The concept asks the student to name a LOSS, which is not what this beat shows. False Balance ('looks steady from outside — show the crack') is the job here. |
| Obstacles and crises; more chances to change | rebirth-redemption | `obstacles` | `warning-ignored` | Escalation is only half the beat. The rebirth-specific half — repeated chances and reasons to change, which he keeps waving away — is taught by Warning Ignored, not by Rising Obstacles. |
| Compelled to run away from the truth | rebirth-redemption | `lowest-point` | `refusal` | missing how to write avoidance: lowest-point teaches the bottom (goal lost, ally stripped), but this beat is a second refusal — refusal teaches saying no because of the flaw, with an action. |
| Lowest point; mounting sense of threat and despair | tragedy | `lowest-point` | `?` | in tragedy the third criterion is false — it promises 'the change has to be EARNED out of this, later', but a tragic protagonist does not come back up; the tragedy-specific note is missing. |
| Suddenly realises things will never be the same | rebirth-redemption | `lowest-point` | `epiphany` | this is a RECOGNITION beat, not a despair beat; lowest-point's 'strip the ally, mask goes back on' does not teach how to write a realisation landing on a character. |

## New concepts proposed (17)

- `dark-mentor-faith`
- `dark-mentor`
- `the-reward`
- `admirable-first`
- `unlikeable-first`
- `doubling-down`
- `dark-mentor-falls`
- `accusation-unheard`
- `separation-from-what-matters`
- `final-realisation`
- `allies-pay-off`
- `the-prize-won`
- `defending-the-prize`
- `tests-and-learning`
- `flaw-exploited`
- `dark-acts-escalate`
- `futile-struggle`

## Every beat, with its authored WHY

The **why** is authorial craft knowledge for the student's understanding — NOT beat content, and never to be
written into their outline (Neil, 2026-08-03: *"the student cannot write 'so the redemption lands'; it needs
to be shown and not told"*).

| beat | archetypes | why this beat exists |
|---|---|---|
| A random ally appears; will return later | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so the later rescue is a payoff you planted, not lucky timing |
| A shadow begins to intrude; increasingly alarming | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so dread builds before anything happens, and the reader feels it coming |
| A shadowy figure may appear | tragedy | so the reader feels the doom closing in before it arrives |
| A storm is coming; onset of evil felt in the air | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so the air changes before the danger does, and tension starts early |
| A storm is coming; something threatening | tragedy | so the reader senses the ruin coming while the hero does not |
| Allies abandon the protagonist | tragedy | so the tragic hero faces the end alone, with nobody left to stop them |
| Allies disagree on what to do next | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the protagonist is stripped of support right before the hardest part |
| Allies pull out their own bag of tricks | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so every ally you introduced earns their place in the ending |
| Alternating periods of rest, and advice from mentors | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | so the reader can breathe and a conversation can change him |
| An ally betrays the protagonist | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the danger becomes personal and the protagonist can trust only themselves |
| Approach to the inmost cave | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the reader dreads the place before he goes into it |
| Attacked again; resistance does not work | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so losing twice proves they must change, not just try harder |
| B Story: discussion about the Theme | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the story's truth gets said out loud by people, not the author |
| But things begin to go wrong | tragedy | so the reader sees the dream souring before the hero does |
| But things continue to go wrong | rebirth-redemption | so the reader watches their world darken while they refuse to change |
| Community is liberated; balance is restored | heros-journey, overcoming-the-monster, rags-to-riches, rebirth-redemption, voyage-and-return | so the reader sees the victory changed everyone, not just the hero |
| Community may rejoice in or mourn the death | tragedy | so the death means something to the world, not only to him |
| Compelled to commit dark acts | tragedy | so each crime forces the next, and turning back stops being possible |
| Compelled to run away from the truth | rebirth-redemption | so he is given one last chance to face it, and refuses |
| Dark figures also cast shadow over community | rags-to-riches | so the reader sees a whole world that needs putting right |
| Dark figures mistreat the protagonist | rags-to-riches | so the reader wants him to rise before he even tries |
| Dark force accuses protagonist of being the same; not fooled | rebirth-redemption | so he proves by acting that he is no longer what he was |
| Dark forces accuse protagonist of being the same; not fooled | rags-to-riches | so the protagonist proves the riches did not make them the villain |
| Dark forces appear to have cornered the protagonist | rags-to-riches | so the reader stops seeing a way out, and fears they lose everything |
| Dark forces are dealt a fatal blow | rags-to-riches | so the thing that oppressed them is beaten, by them, on the page |
| Dark forces dealt a fatal blow; goal is won | the-quest | so the quest is finished by the hero's own hand, not by luck |
| Dark forces demonstrate their power again | rags-to-riches | so the new position is nearly taken back before they defend it |
| Dark Herald guides protagonist to meet the Dark Mentor | tragedy | so he is led to the meeting that sets his ruin going |
| Dark Mentor dies | tragedy | so he is left alone with the ruin his corrupter started |
| Dark Mentor fights the opposition and loses | tragedy | so his last support is stripped before the end |
| Dark Mentor has faith protagonist will overcome | tragedy | so the push toward ruin comes from someone he trusts and likes |
| Dark power begins to dominate | rebirth-redemption | so the reader sees how much must be overcome for redemption to count |
| Dark power demonstrates its power again | rebirth-redemption | so the pull back to the old self is at its strongest |
| DREAM STAGE - THE SPECIAL WORLD - THE JOURNEY | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the new world feels wondrous first and uneasy underneath |
| Everything suddenly goes wrong | heros-journey, coming-of-age, rags-to-riches, the-quest, tragedy, voyage-and-return | so the collapse feels earned — one failure knocking over the next |
| Expand on the opening image | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so we see their whole world, and the hole in the middle |
| Face to face with the Monster and its awesome power | overcoming-the-monster | so the reader sees what he is up against before he fights it |
| Final Image: opposite of Opening Image | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the reader SEES the change instead of being told about it |
| Final nightmare battle approaches | heros-journey, coming-of-age, rags-to-riches, rebirth-redemption, voyage-and-return | so the reader feels it coming and he has to get ready |
| Final supreme battle approaches | the-quest | so the last stretch feels like the hardest part of the journey |
| Final supreme ordeal approaches | overcoming-the-monster | so the reader knows everything now rests on what happens next |
| FIRST EPIPHANY: moment of genuine insight | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the change starts small and the reader believes the later transformation |
| Focused on solving a very simple problem | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the story starts small and believable, not with a grand mission |
| For a while all may seem to go well; threat recedes | rebirth-redemption | so the reader relaxes, and the collapse that follows hurts more |
| For a while all seems to be going well | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so the reader believes it might work before it stops working |
| For a while protagonist seems to be getting away with it | tragedy | so his ruin looks chosen, not unlucky — he could still have stopped |
| Forces of opposition and fate closing in | tragedy | so escape is impossible and the ending feels inevitable |
| Foreshadows: hints of potential and impending change | coming-of-age | so the change later feels earned, not sprung on the reader |
| Foreshadows: plant elements of anticipation | heros-journey, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the ending pays off something the reader already half remembers |
| FRUSTRATION | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the easy way stops working and they must change approach |
| Given supernatural or visionary direction; ONLY HE/SHE can solve it | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so the reader accepts that only this person can do it |
| Glimpse of true self; warmer humanity, potential to change | rebirth-redemption | so the reader believes redemption is possible before it happens |
| Goal becomes much more specific | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | so the reader knows exactly what winning would look like |
| Greater crises | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the danger keeps rising instead of repeating, and the reader stays hooked |
| Greater obstacles before getting the prize | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | so the prize feels earned rather than handed over |
| Greater obstacles; reminded of repressed emotional wound | rebirth-redemption | so we understand why he became this, before we watch him change |
| Has he/she changed or was it all just a dream? | rebirth-redemption | so the ending proves the change instead of just claiming it |
| Has he/she grown or was it all just a dream? | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so the reader can see exactly what the journey was worth |
| He encounters inner demons and temptations | rebirth-redemption | so his change is a struggle, not a switch he simply flips |
| Herald gives special piece of information | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the news that changes everything arrives from outside, not from their head |
| Herald guides protagonist to meet the Mentor | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so someone outside his life brings him to the person who can help |
| Hero and companions establish a community | the-quest | so the quest ends in a new life built, not just a prize won |
| Hero and companions set out across hostile terrain | overcoming-the-monster, the-quest | so the journey physically begins and turning back stops being easy |
| Hero appears whole for all the future | overcoming-the-monster, the-quest | so the change reads as permanent, not a mood that will wear off |
| Hero arrives within sight of goal | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | so the reader feels how close success is before the hardest part |
| Hero becomes committed to his course of action | tragedy | so the fall is his own choice, not bad luck |
| Hero becomes focused on this object | tragedy | so the reader knows exactly what the hero will destroy themselves chasing |
| Hero becomes separated from what's important | rags-to-riches, the-quest | so losing what mattered most forces them to prove who they really are |
| Hero begins to feel frustrated | tragedy | so the hero's impatience pushes them towards the choice that destroys them |
| Hero emerges to win the prize | overcoming-the-monster, the-quest | so the reader finally gets the payoff the whole story promised |
| Hero emerges to win the prize; role in the Kingdom | rags-to-riches | so the ending repays everything the lowly opening made us want for them |
| Hero excited or fascinated by the new world | tragedy | so the thrill of the new life hides the danger inside it |
| Hero experiences a Call to confront it | overcoming-the-monster | so the hero must face the monster instead of hiding from it |
| Hero feels terrible and disgusted with false identity | rebirth-redemption | so the old self becomes unbearable and change starts feeling necessary |
| Hero finds fulfillment in reconnecting with humanity | rebirth-redemption | so the redemption is proved by people letting him back in |
| Hero has increased awareness of need to change | rags-to-riches | so he starts wanting to act instead of just enduring |
| Hero ignores this warning | rebirth-redemption | so the disaster ahead is his own fault, not bad luck |
| Hero is excited or fascinated by the new world | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so the reader feels the wonder before the world turns on them |
| Hero looks for unusual gratification | tragedy | so we see the appetite that will destroy him before it does |
| Hero makes preparations to defend winnings | tragedy | so keeping the prize costs him more than winning it did |
| Hero may fall into the monster's clutches | overcoming-the-monster | so the monster feels genuinely deadly before the hero can beat it |
| Hero may fall into the shadow's clutches | heros-journey, coming-of-age, rags-to-riches, the-quest, tragedy, voyage-and-return | so the reader believes the hero could actually lose here |
| Hero seeks harmful gratification; community suffers | rebirth-redemption | so his redemption costs something — the reader saw who he hurt |
| Hero surpasses the Dark Mentor | tragedy | so we see he has gone further into darkness than his corrupter did |
| Hero surpasses the Mentor | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so the final win is theirs alone, not the mentor's |
| HIGHER STAKES | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so every failure now costs more and the reader cannot relax |
| Highlight the immaturity that needs to be overcome | coming-of-age | so we can measure how far they have grown by the end |
| How much has the protagonist learnt? | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so the story answers the question it asked at the start |
| If the protagonist's life stays the same, figurative death | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the reader knows what is lost if nothing changes |
| If they don't learn, same problem likely to happen again | tragedy | so the warning outlives him — the same danger is still loaded |
| If they mourn, they may realise the problem in society | tragedy | so the survivors learn what the hero understood far too late |
| In the nick of time, the protagonist changes | rebirth-redemption | so the change comes late enough to cost him and still save him |
| In the nick of time, the protagonist escapes | heros-journey, coming-of-age, overcoming-the-monster, the-quest, voyage-and-return | so the escape is won by seconds, and the danger stays believable |
| INCITING INCIDENT - CALL TO ADVENTURE | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the old life ends and the story properly starts |
| Journey into the underworld; confronting deepest fears | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so he faces the fear in a place that looks like it |
| Lowest point; mounting sense of threat and despair | tragedy | so the bottom is real, and nothing after it can rescue him |
| Main character's flaw is revealed | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | so the story has something to fix, and the ending can prove it |
| Main character's flaw revealed (may be another character's flaw) | rebirth-redemption | so we know exactly what must change before redemption can be believed |
| May contact spirits who give strange or mistaken guidance | tragedy | so his downfall grows from believing a truth he heard the wrong way |
| May have a false sense of balance or complete imbalance | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the reader feels the crack before anything actually breaks |
| Mentor fights dark forces and loses | rebirth-redemption | so nobody else can save them — the fight has to be theirs |
| Mentor fights monster and loses | overcoming-the-monster | so the monster is proved unbeatable by anyone but them |
| Mentor fights villain and loses | heros-journey, coming-of-age, rags-to-riches, the-quest, voyage-and-return | so the last helper is removed and they must finish it alone |
| Mentor has faith protagonist will be able to change | rebirth-redemption | so someone believes he can change before he believes it himself |
| Mentor has faith protagonist will overcome challenges | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so he risks the next step because someone who knows has backed him |
| Mentor informs of consequences if they do not change | rebirth-redemption | so he knows exactly what staying the same will cost him |
| Mentor informs of the dark force's rise to power | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | so the threat feels real and growing before he ever faces it |
| Mentor sacrifices himself to save the protagonist | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so the hero carries a debt into the final fight |
| Mentor shares a prophecy | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so he acts on a promise he only half understands |
| Mentor warns about going against their advice | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so ignoring the advice later reads as his own choice |
| Monster advances like a bulldozer | overcoming-the-monster | so the reader sees the monster is unstoppable unless the hero changes |
| Monster appears to have cornered the protagonist | overcoming-the-monster | so the fight feels lost before the hero finds a way to win |
| Monster attacks the protagonist in final attempt | overcoming-the-monster | so the monster is most dangerous exactly when the hero must win |
| Monster begins to dominate; powerful forces unleashed | overcoming-the-monster | so beating the monster later actually means something |
| Monster casts shadow over community | overcoming-the-monster | so beating the monster matters to more people than just him |
| Monster demonstrates his power again | overcoming-the-monster | so the final fight feels genuinely dangerous, not a formality |
| Monster is dealt a fatal blow | overcoming-the-monster | so the monster dies by the hero's hand, in a scene we watch |
| Mood changes to frustration, difficulty, or oppression | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the reader can measure how far things have fallen since the start |
| More obstacles, crises and conflicts; thrilling escape | overcoming-the-monster | so the danger grows step by step before the real fight arrives |
| New Information: second Catalyst, choice to continue | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so going on is a deliberate choice, not just stubbornness |
| Nightmare battle; battle to defeat the old self | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so beating the enemy and beating his old self are one act |
| Obstacles and crises; more chances to change | rebirth-redemption | so refusing to change again makes the final change cost more |
| Obstacles, betrayal, crises and conflicts | coming-of-age | so each setback is harder, and growing up costs something real |
| Obstacles, crises and conflicts ending in thrilling escape | heros-journey, rags-to-riches, the-quest, voyage-and-return | so the journey gets harder each time, and progress feels earned |
| Obstacles, crises with those once close to | tragedy | so the hero's fall costs them everyone who could have pulled them back |
| Opening balance deteriorates | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the reader feels the settled life can no longer hold |
| Opening Image represents the central struggle & tone | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the first picture already carries the story's struggle and its mood |
| Opponent understands the protagonist's weakness | tragedy | so he is destroyed by his own flaw, not by chance |
| Opposition advances | tragedy | so the walls close in while the hero keeps making things worse |
| Opposition demonstrates his power again | tragedy | so the hero's fall is caused by a force stronger than them |
| Oppressive life casts shadow over the community | heros-journey, coming-of-age, the-quest, voyage-and-return | so the change the story wants is bigger than one person |
| Painful past experience revealed | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the flaw has a cause, and changing later feels possible |
| Protagonist accepts his/her fate forever | tragedy | so he faces the ending he made instead of being rescued |
| Protagonist accuses opponents; opponent does not listen | tragedy | so his last chance to be understood fails and the fall completes |
| Protagonist comes back from dead; one last attempt to change | rebirth-redemption | so the final change comes from something planted earlier, not luck |
| Protagonist comes back from dead; one last attempt to destroy monster | overcoming-the-monster | so the hero's return to fight is earned, not a lucky rescue |
| Protagonist comes back from the dead for one last attempt | heros-journey, coming-of-age, rags-to-riches, the-quest, tragedy, voyage-and-return | so the last attempt is powered by something we already met |
| Protagonist crosses the threshold into the special world | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the commitment is a physical act the reader can see |
| Protagonist decides to die with honour and glory | tragedy | so he goes down knowing the truth, choosing pride over survival |
| Protagonist discovers his/her own true power | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the change shows in what he does, not what he feels |
| Protagonist encounters further monsters and temptations | heros-journey, coming-of-age, rags-to-riches, the-quest, tragedy, voyage-and-return | so the middle keeps rising instead of drifting |
| Protagonist excited or fascinated by the new world | rebirth-redemption | so the escape feels exciting before it starts costing him |
| Protagonist experimenting and learning from tests | overcoming-the-monster | so the hero earns the skills the final fight will demand |
| Protagonist has increased awareness of dangers ahead | the-quest | so setting out is a real choice — he knows the risk |
| Protagonist has increased awareness of the monster | overcoming-the-monster | so the monster frightens the reader long before it appears |
| Protagonist has limited awareness, disconnected from reality | rebirth-redemption | so his blindness explains the harm he does to other people |
| Protagonist has limited awareness, disconnected, unfulfilled | tragedy | so his blindness, not bad luck, starts the fall |
| Protagonist has limited awareness, naive, ignorant... | heros-journey, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so the reader can watch them learn what they do not know |
| Protagonist in false identity; believes not worthy | rebirth-redemption | so we see the armour before we see the wound it hides |
| Protagonist in state of youthful naivety, lacking responsibility | coming-of-age | so we can measure how far they grow up by the end |
| Protagonist is given the elixir | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so the later rescue was planted early and never feels like cheating |
| Protagonist is killed by forces or final act of violence | tragedy | so the flaw is paid for, and the story keeps its promise |
| Protagonist is living in a false identity | tragedy | so the fall comes from the lie he refuses to drop |
| Protagonist is living in a false identity or anonymous | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so we can watch the mask crack and the real self appear |
| Protagonist is presented with a sword | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the new identity has an object the reader can see |
| Protagonist makes preparations for battle | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so the reader sees what the fight will cost before it starts |
| Protagonist makes preparations to change | rebirth-redemption | so the change looks earned, not a sudden switch at the end |
| Protagonist meets the Dark Mentor; overcoming fear | tragedy | so someone he trusts gives him permission to do the wrong thing |
| Protagonist meets the Mentor; overcoming fear of change | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so someone who has been there makes the change feel possible |
| Protagonist overshadowed by dark figures | rags-to-riches | so the reader can measure how far he has risen by the end |
| Protagonist overshadowed by oppressive life | heros-journey, coming-of-age, the-quest, voyage-and-return | so the reader knows what he is trapped in before anything happens |
| Protagonist overwhelmed with despair; retreats to false identity | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so the mask going back on shows how much the change costs |
| Protagonist presented with admirable, desirable qualities | tragedy | so the audience loves him first and the fall actually hurts |
| Protagonist presented with unlikeable, inhumane qualities | rebirth-redemption | so the redemption lands — we must dislike him before he changes |
| Protagonist receives a warning; threat becomes visible | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so the danger stops being rumour and the reader starts to worry |
| Protagonist receives apparent wisdom and ambiguous gifts | tragedy | so his confidence rests on advice that was never what it seemed |
| Protagonist receives crucial wisdom and/or gifts | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so they enter the final test holding something they lacked before |
| Protagonist receives new clothes, symbolic of new identity | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the change is visible on the outside, not just stated |
| Protagonist reflects on past mistakes; expresses regret | tragedy | so the reader sees him understand, exactly when it is too late |
| Protagonist refuses again; stuck in ordinary world | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so we see the flaw actively holding them back, not bad luck |
| Protagonist returns with elixir; mastered himself | rebirth-redemption | so the change is proved by what they give back, not what they say |
| Protagonist returns with elixir; newfound wisdom | overcoming-the-monster, rags-to-riches, voyage-and-return | so the community gains something from the journey, not just the hero |
| Protagonist returns with elixir; newfound wisdom and maturity | coming-of-age | so growing up is shown by what they can now give others |
| Protagonist returns with the elixir; newfound wisdom | heros-journey | so the journey changes the world the hero left, not only the hero |
| Protagonist sees a way to fix it | heros-journey, coming-of-age, rags-to-riches, voyage-and-return | so the story has a plan simple enough to go wrong later |
| Protagonist sees a way to fix it, such as a long journey | the-quest | so the journey is chosen by them, and simple enough to fail |
| Protagonist sees life as oppressive, even though has a lot | tragedy | so his hunger for more looks inevitable before he does anything wrong |
| Protagonist sees more signs why he needs to change | rebirth-redemption | so his refusal to change reads as a choice, not ignorance |
| Protagonist seizes the sword; accepts new identity | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so he takes the new self knowing exactly what it will cost |
| Protagonist shows glimpse of true self | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | so the reader roots for them and believes they could succeed later |
| Protagonist starts to become more open to change | rebirth-redemption | so the change later is not sudden — the door opens first |
| Protagonist struggles to escape | tragedy | so we watch him fight, and still lose — the loss must be earned |
| Protagonist suffers a physical attack | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | so the reader learns the danger is real and the goal is not free |
| Protagonist understands the dark force's weakness | rebirth-redemption | so the dark force is beaten by understanding, not by luck |
| Protagonist understands the dark forces' weakness | rags-to-riches | so the underdog wins by working it out, not by luck |
| Protagonist understands the monster's weakness | overcoming-the-monster | so the monster is beaten by cleverness the reader can follow |
| Protagonist understands the villain's weakness | heros-journey, coming-of-age, the-quest, voyage-and-return | so the win comes from something the hero noticed earlier |
| Protagonist willing to sacrifice for others | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so the change is proved by what they are willing to lose |
| Protagonist's goal here is general; something normal | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so we know their ordinary life before the story wrecks it |
| Protagonist's goal is a façade at this stage | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the real need can surface later and surprise them |
| Protagonist's life is oppressive because he is alone | rebirth-redemption | so his loneliness is the thing the redemption has to undo |
| Receives sign or warning urging him to change | rebirth-redemption | so he is offered a fair chance to change before losing it |
| Refuses the call; weakness revealed | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so their weakness is on the page before they have to beat it |
| Reversal: Mentor or ally brings protagonist back to life | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the rescue pays off someone the reader already knows |
| SECOND EPIPHANY: deeper realisation | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so the protagonist stops reacting and starts choosing what happens next |
| Serious threat to hero's survival; seems only one outcome | heros-journey, coming-of-age, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the danger is real and the reader can see no escape |
| Shadow begins to dominate; powerful forces unleashed | heros-journey, coming-of-age, rags-to-riches, the-quest, tragedy, voyage-and-return | so the opposition is strong enough to make the victory worth reading |
| Small group of allies may welcome the protagonist | rebirth-redemption | so he is not alone when the change starts — someone lets him in |
| Small group of allies welcomes the Hero | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | so the team we will follow is introduced as the new world opens |
| Snapshot of the main character's problem | heros-journey, coming-of-age, overcoming-the-monster, rebirth-redemption, the-quest, tragedy, voyage-and-return | so we watch the problem happen instead of being told about it |
| Some object of desire presents itself | tragedy | so the hero has something to want that will cost them everything |
| Someone appears who gives guidance | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, voyage-and-return | so help arrives as a question, and the choice stays his |
| Someone shows him the consequences of his actions | rebirth-redemption | so he cannot deny the harm any more — he has seen it |
| Something calls or sends protagonist into wider world | rags-to-riches | so they leave the small world where they could never rise |
| Something reminds protagonist of need to change | rebirth-redemption | so his change starts with something he notices, not something he is told |
| State of the world deteriorates | overcoming-the-monster, rags-to-riches, the-quest | so the reader can measure how much worse things have got |
| State of the world deteriorates; increased awareness | heros-journey, coming-of-age, rebirth-redemption, voyage-and-return | so pressure builds until doing nothing stops being possible |
| Steps beyond false identity forever; transformed | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so the old self cannot come back — the reader sees it end |
| STUNNING SURPRISE #1: something shocking changes everything | voyage-and-return | so his old plan dies and he is forced to change course |
| STUNNING SURPRISE #1: Something shocking changes everything | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy | so his old plan dies and he is forced to change course |
| STUNNING SURPRISE #2: another shock destroys the plan | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the safe route to victory closes and he must improvise |
| Suddenly realises things will never be the same | rebirth-redemption | so he finally sees there is no going back to who he was |
| Tension begins to rise | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the reader senses trouble before anything has actually happened |
| The Dark Mentor awaits | tragedy | so we know the person who will ruin him is already waiting |
| The hero seems powerless | rebirth-redemption | so we feel the old self holding him down, not just hear it |
| The hero seems tiny and alone | overcoming-the-monster | so the monster feels overwhelming and beating it means something |
| The Mentor awaits | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so the story has someone who already knows what he must learn |
| The ordinary world | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the reader knows the life this story is about to break |
| The prophecy is incomplete | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the ending can surprise him without cheating the reader |
| Theme Stated during the Set-up | heros-journey, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the ending feels true — the reader was told it at the start |
| Theme Stated: growth, maturity, or self-discovery | coming-of-age | so the lesson he grows into was said before he could hear it |
| There seems only one outcome | overcoming-the-monster | so the monster looks unbeatable right before the hero beats it |
| Things going downhill; trouble letting go of old self | rebirth-redemption | so the reader believes how hard letting go really is |
| Things out of control; retreats to false identity | tragedy | so his refusal to drop the lie is what destroys him |
| THIRD EPIPHANY: enlightened, possibly via redemption figure | rebirth-redemption | so the reader sees the change is real, not just a scare |
| THIRD EPIPHANY: protagonist becomes enlightened | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, the-quest, tragedy, voyage-and-return | so the hero finally understands the truth the whole journey was teaching |
| This is his/her lowest point | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, voyage-and-return | so the change afterwards has to be earned, not simply handed over |
| Time is running out to change | rebirth-redemption | so the redemption has a deadline the reader can feel slipping away |
| TURNING POINT #1: Opportunity | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so something from outside forces the story to start |
| TURNING POINT #2: Change of Plans | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the protagonist now has a clear goal we can watch them chase |
| TURNING POINT #3: Point of No Return | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so going back becomes impossible and they must see it through |
| TURNING POINT #4: Major Setback | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so everything they built collapses and the change has to be earned back |
| TURNING POINT #5: Climax | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the story delivers the showdown it promised, done by them |
| TURNING POINT: Anticipation | heros-journey, coming-of-age, overcoming-the-monster, rags-to-riches, rebirth-redemption, the-quest, tragedy, voyage-and-return | so the reader feels something coming before anything actually happens |
| Villain accuses protagonist of being the same; not fooled | heros-journey, coming-of-age, the-quest, voyage-and-return | so they must prove the difference by what they do next |
| Villain advances like a bulldozer | heros-journey, coming-of-age, rags-to-riches, the-quest, voyage-and-return | so the danger keeps growing while the protagonist is still not ready |
| Villain appears to have cornered the protagonist | heros-journey, coming-of-age, rebirth-redemption, the-quest, voyage-and-return | so the villain proves dangerous, and the escape has to cost something |
| Villain demonstrates his power again | heros-journey, coming-of-age, the-quest, voyage-and-return | so the reader doubts they can win right before they do |
| We become aware of the monster from a distance | overcoming-the-monster | so the monster feels huge before we ever see it |
| We feel comfortable and immune from danger | rags-to-riches | so the reader is lulled and the reversal lands like a shock |
| We gradually learn of its reputation | overcoming-the-monster | so what people say about it does the frightening for you |
| We meet the protagonist in their lowly state | rags-to-riches | so the rise can be measured against exactly how low they started |
