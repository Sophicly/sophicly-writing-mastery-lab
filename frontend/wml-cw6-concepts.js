/**
 * wml-cw6-concepts.js — the CW Step-6 CONCEPT MAP (v7.20.296)
 *
 * ⭐ WHY THIS FILE EXISTS (WML CLAUDE.md 4c.9, "MAP TO CONCEPTS, NEVER AUTHOR PER ROW").
 * The eight plot templates in OUTLINE_CRITERIA.cwPlotArchetypes hold 881 beat rows, 801 of
 * them askable. Per-row authoring is a job that never finishes. Measured, not estimated:
 * those 801 rows carry only 231 DISTINCT labels, and those 231 labels are a much smaller set
 * of RECURRING STORY CONCEPTS reworded per archetype ("the ordinary world" · "the flaw" ·
 * "crossing the threshold" · "the lowest point" · "the final image mirrors the opening").
 *
 * So the deliverable is a row → CONCEPT map. Each concept carries, once, everything the
 * help ladder needs at every rung that does NOT cost an API call:
 *   rung 0  crit  — what makes this beat strong (criteria upfront, 4c.1)
 *   rung 0  ex    — ONE worked example, inline in the ask (4c.2 / 4c.9)
 *   rung 1  more  — 2-3 further worked examples, code-served on [💡 More examples]
 *   rung 2  tech  — the Table of Techniques card(s) for the exact concept
 *   nudge         — does this beat get the symbolic nudge? (Neil ruling 2026-07-25:
 *                   ONLY image / symbol / turning-point beats. Everywhere else the ask is
 *                   plain — a nudge on all ~100 rows becomes wallpaper by beat 15.)
 *
 * ⚠ `tech` SYMBOLS ARE PROD-VERIFIED, NEVER GUESSED. A symbol absent from the deployed
 * sophicly-notes table opens the card panel with nothing in it. Every symbol here was checked
 * against the PROD asset (sophicly-notes 2.6.116, assets/js/sophicly-techniques.js — 231
 * cards) and is re-checked mechanically on every ship by bin/cw6-outline-harness.js against
 * bin/cw6-prod-technique-symbols.txt. `Wa` (Want vs Need), `Ey` (Empathy) and `Gh` (The
 * Ghost / Wound) are NOT on prod — do not wire them here until they are.
 *
 * MATCHING: `m` is tested against the beat's `label` and its `prompt`, in template order,
 * FIRST MATCH WINS — so order the array from specific to general. A row that matches nothing
 * still gets a complete ask (the template's own label + prompt as the criteria, plus the
 * stage-level example) — the walk never asks a bare question.
 *
 * Examples are drawn from texts the students know, deliberately varied across concepts
 * (A Christmas Carol · Macbeth · An Inspector Calls · Jekyll and Hyde · Romeo and Juliet ·
 * Of Mice and Men · Lord of the Flies · Animal Farm · Frankenstein · Great Expectations ·
 * The Lion King · Harry Potter · The Hunger Games · Cinderella · Stranger Things), never
 * invented, never the same text twice in a row (feedback_student_content_derives_from_protocols).
 */
(function () {
    'use strict';

    // ── PER-STAGE FALLBACK ──────────────────────────────────────────────────────────────
    // Every stage carries a worked example of its own, so a row matching NO concept is still
    // an ask with criteria and an example. Sourced from the Creative Writing Reference Guide's
    // "The six stages" section (resources/creative-writing-reference-guide.md) — the same
    // teaching, so the two cannot drift apart on the substance.
    const STAGES = {
        'setup': {
            name: 'Stage I — Setup',
            job: 'the ordinary world, and the mask your protagonist hides behind, ending in the event that breaks it open',
            ex: '*The Lion King:* Simba is the cocky cub prince of the Pride Lands — until Mufasa is killed and Scar convinces him it was his fault.',
            concepts: {
                forWhat: "We meet your protagonist in their ordinary world and learn what is missing — so that when it breaks, the reader already cares.",
                seeing: "A life that looks stable but is not. The **mask** (the false self) doing its job. And an early sign that something must change — which your protagonist ignores.",
                pattern: "ordinary world → the mask holds → a warning is ignored → **the turning point that ends the ordinary world for good**",
            },
            guide: 'The six stages',
        },
        'dream': {
            name: 'Stage II — The Dream Stage',
            job: 'the adventure begins and it feels GOOD — early success, a first glimpse of the true self, a mentor, the threshold crossed',
            ex: '*Cinderella:* with help she reaches the ball and, for one night, is seen for who she truly is.',
            concepts: {
                forWhat: "The adventure starts, and it feels GOOD. This is where the reader gets the story they were promised.",
                seeing: "Early wins. The first real glimpse of who your protagonist could become. Often a mentor. And the moment they cross into the new world.",
                pattern: "crossing the threshold → early success → the true self flickers into view",
            },
            guide: 'The six stages',
        },
        'fascination': {
            name: 'Stage III — Initial Fascination',
            job: 'your protagonist wavers between the old self and the new as complications gather — tested, and not yet winning cleanly',
            ex: '*Stranger Things:* the danger widens, the adults disbelieve them, and it creeps closer to home.',
            concepts: {
                forWhat: "Your protagonist wavers between the old self and the new while the pressure gathers.",
                seeing: "Tests they do not cleanly win. Old habits creeping back under stress. Complications widening beyond the first problem.",
                pattern: "vacillation → rising complications → the midpoint, where they stop reacting and start pursuing",
            },
            guide: 'The six stages',
        },
        'nightmare': {
            name: 'Stage IV — The Nightmare Stage',
            job: 'everything goes wrong; the stakes climb and your protagonist hits their lowest point',
            ex: '*Macbeth:* the nobles turn against him, Lady Macbeth dies, and he faces the end alone.',
            concepts: {
                forWhat: "Everything goes wrong. This is the lowest point — and it is what makes the change cost something.",
                seeing: "The plan fail. The shield go back up. The goal look genuinely lost.",
                pattern: "setback → collapse → **the Dark Moment**. Truby and Edson agree: only from here can real change be earned.",
            },
            guide: 'The six stages',
        },
        'final-push': {
            name: 'Stage V — The Final Push',
            job: 'your protagonist drops the mask for good and drives to the climax — this is where the change is won',
            ex: '*A Christmas Carol:* faced with his own neglected grave, Scrooge chooses people over money.',
            concepts: {
                forWhat: "Your protagonist returns to the true self, drops the mask for good, and drives to the climax.",
                seeing: "A decisive confrontation. A thrilling escape from destruction. The change finally won rather than given.",
                pattern: "the choice → the confrontation → the change won",
            },
            guide: 'The six stages',
        },
        'aftermath': {
            name: 'Stage VI — Goal and Aftermath',
            job: 'the transformation completes, the world is set right, and the final image mirrors the opening',
            ex: '*The Lion King:* a new cub raised on Pride Rock mirrors Simba’s own beginning — the circle complete.',
            concepts: {
                forWhat: "Show that the change was real.",
                seeing: "The world set right, and a final image that **mirrors your opening** — so the distance travelled is visible on the page.",
                pattern: "resolution → the mirrored final image, proving the transformation",
            },
            guide: 'The six stages',
        },
    };

    // ── THE CONCEPT MAP ─────────────────────────────────────────────────────────────────
    // Specific → general. First match wins.
    const CONCEPTS = [

        // ───────────────────────── STAGE I — SETUP ─────────────────────────
        {
            id: 'opening-image', name: 'Opening Image', nudge: true,
            val: 'neg', valBy: { tragedy: 'pos' },
            m: /opening image/i,
            // v7.20.376 (Neil, #124): was [Cy Cyclical Structure, Sy Symbolism]. Cyclical Structure
            // is DEFENSIBLE on concept — this beat's own third criterion says the image will be
            // mirrored at the end — but WRONG on MOMENT: its card's three worked examples are all
            // CLOSING images, so a student writing their opening tapped through to the end of the
            // device. The mirror is already taught by the criterion above; the card is not the help
            // they need here. Imagery is what this beat actually asks for ("ONE picture a camera
            // could hold"), and it is the same chip its sibling 'The Opening Image, Expanded'
            // already offers. Cy stays on 'The Final Image' (Stage VI), where the payoff lands.
            // Both symbols verified against bin/cw6-prod-technique-symbols.txt.
            tech: [{ s: 'Im', l: 'Imagery' }, { s: 'Sy', l: 'Symbolism' }],
            crit: [
                'ONE picture a camera could hold — a place, an object, a person doing one thing',
                'it carries the story’s central struggle and its TONE before a word of plot happens',
                'it will be MIRRORED by your final image, so choose something you can show changed at the end',
            ],
            ex: '*A Christmas Carol:* Scrooge alone in a freezing counting-house, refusing his clerk a second lump of coal — greed and cold in one picture.',
            more: [
                '*Of Mice and Men:* two men walking a dusty road with everything they own on their backs — hope and homelessness together.',
                '*Lord of the Flies:* a scar torn through the jungle by the crashed plane — paradise already damaged.',
                '*The Hunger Games:* Katniss wakes on reaping morning to the cold hollow where her sister should be — the day the district gives up a child.',
            ],
        },
        {
            id: 'final-image-setup', name: 'The Opening Image, Expanded', nudge: true,
            val: 'neg', pri: 1,
            m: /expand on the opening image/i,
            tech: [{ s: 'Im', l: 'Imagery' }, { s: 'Se', l: 'Setting' }],
            crit: [
                'stay in the SAME moment as your opening image — widen the lens, do not jump forward',
                'show what their world holds AND what is missing from it',
            ],
            ex: '*Great Expectations:* widen from Pip alone in the churchyard to the flat, wet marshes and the distant prison hulks — a small boy in a large, cold world.',
            more: [
                '*Animal Farm:* widen from the drunk farmer stumbling to bed to the whole neglected farm, hungry animals in every shed.',
                '*A Christmas Carol:* widen from Scrooge’s counting-house to the fog-choked street outside — carol singers, charity collectors, a whole city of warmth he has shut out.',
                '*Of Mice and Men:* widen from the two men at the pool to the Salinas riverbank at dusk — willows, a path beaten hard by men who slept there before, and no home at the end of it.',
            ],
        },
        {
            id: 'ordinary-world', name: 'The Ordinary World', nudge: false,
            val: 'neg', valBy: { tragedy: 'pos' },
            m: /ordinary world|world as it is|lowly state|youthful naivety|meet the protagonist/i,
            // v7.20.378 (#131): In Medias Res lands HERE — beat 1, the story's actual first
            // askable row, and the one place the choice is live. It is the direct ALTERNATIVE to
            // Exposition (drop the reader into the action instead of setting the scene), so the
            // two chips sitting side by side is the lesson. ⚠️ I first put it on `opening-image`
            // and the §5d gate rejected it: the templates open on "The ordinary world" (beat 1)
            // and Opening Image is beat 4. The gate reads the templates; I had guessed.
            tech: [{ s: 'Xp', l: 'Exposition' }, { s: 'Se', l: 'Setting' }, { s: 'Ir', l: 'In Medias Res' }],
            crit: [
                'their NORMAL — the life that was running before your story started',
                'one specific place and one specific routine, not a summary of their personality',
            ],
            ex: '*An Inspector Calls:* the Birlings at a comfortable dinner table, celebrating an engagement, entirely pleased with themselves.',
            more: [
                '*The Hunger Games:* Katniss slipping under the District 12 fence to hunt, because the alternative is going hungry.',
                '*Jane Eyre:* Jane hidden behind a curtain in the window-seat at Gateshead, reading, out of everyone’s way.',
                '*The Lion King:* Simba waking his father at dawn to be taken to the edge of Pride Rock — an ordinary morning in a kingdom he assumes will always be his.',
            ],
        },
        {
            id: 'false-balance', name: 'False Balance', nudge: false,
            val: 'neg', valBy: { tragedy: 'neu' },
            m: /false sense of balance|complete imbalance/i,
            tech: [{ s: 'Tn', l: 'Tension' }, { s: 'Dj', l: 'Duality' }],
            crit: [
                'the life LOOKS steady from outside, or is visibly falling apart — pick which and show it',
                'if it looks steady, show the crack: one detail that says this cannot hold',
            ],
            ex: '*An Inspector Calls:* the engagement dinner runs perfectly — and Sheila has already noticed Gerald was absent all last summer.',
            more: [
                '*Macbeth:* Scotland has just won its battle, and the witches are already waiting on the heath.',
                '*Harry Potter:* the Dursleys’ morning runs exactly to schedule — and there is a cupboard under the stairs with a boy in it.',
                '*Jekyll and Hyde:* Jekyll’s dinner parties are as respectable as ever, and his will already leaves everything to a man nobody has met.',
            ],
        },
        {
            id: 'figurative-death', name: 'The Cost of Staying', nudge: false,
            val: 'neg',
            m: /figurative death|stays the same|life is oppressive|sees life as oppressive/i,
            tech: [{ s: 'Sk', l: 'Stakes' }],
            crit: [
                'name what your protagonist LOSES if nothing changes — not death, but the death of something in them',
                'make it concrete: a person, a chance, a version of themselves that runs out of time',
            ],
            ex: '*A Christmas Carol:* if Scrooge does not change, he dies with his money and no one at the funeral — which is what the third spirit shows him.',
            more: [
                '*Great Expectations:* if Pip stays at the forge believing he is common, he never finds out what he could have been.',
                '*An Inspector Calls:* if Sheila stays the girl who had a shop assistant sacked for smiling, she becomes her mother.',
                // v7.20.379 (#134): was Simba in the jungle — a Stage III/IV state on a Stage I beat.
                '*The Hunger Games:* if Katniss keeps her head down and trades quietly, Prim’s name goes back in the bowl every year for the rest of her childhood.',
            ],
        },
        {
            id: 'problem-snapshot', name: 'A Snapshot of the Problem', nudge: false,
            val: 'neg',
            m: /snapshot of the main character|character’s problem|character's problem/i,
            tech: [{ s: 'Cf', l: 'Conflict' }, { s: 'Do', l: 'Show, Don’t Tell' }],
            crit: [
                'ONE small scene that SHOWS the problem instead of telling us about it',
                'a camera could film it — no feelings named, only what happens',
            ],
            ex: '*Of Mice and Men:* Lennie will not give up the dead mouse in his pocket, and George has to take it from him — the whole problem, in one exchange.',
            more: [
                '*Romeo and Juliet:* Romeo mopes over a girl who does not want him, and his friends are already tired of hearing it.',
                '*A Christmas Carol:* two gentlemen ask Scrooge for a donation and he asks whether the prisons and the workhouses are still open.',
                '*The Hunger Games:* Katniss sells her poached squirrels to the very Peacekeepers who are supposed to arrest her for poaching.',
            ],
        },
        {
            id: 'the-flaw', name: 'The Flaw', nudge: false,
            val: 'neg',
            m: /flaw/i,
            tech: [{ s: 'Fw', l: 'The Flaw' }, { s: 'Hm', l: 'Hamartia' }],
            crit: [
                'the flaw is a SHIELD — it once protected them, and now it holds them back',
                'show it as behaviour, not a label: "cannot ask for help", not "insecure"',
            ],
            ex: '*Macbeth:* his flaw is ambition he will not question — he acts on the prophecy rather than asking what it costs.',
            more: [
                '*A Christmas Carol:* Scrooge’s flaw is that he decided long ago people cost more than they give.',
                '*Jekyll and Hyde:* Jekyll’s flaw is that he wants his appetites without his reputation paying for them.',
                '*Great Expectations:* Pip’s flaw is that he has learned to be ashamed of Joe — the kindest person in his life.',
            ],
        },
        {
            id: 'theme-stated', name: 'Theme Stated', nudge: true,
            val: 'neu',
            m: /theme stated/i,
            tech: [{ s: 'Tz', l: 'Theme Stated' }, { s: 'Th', l: 'Theme' }],
            crit: [
                'someone SAYS the story’s truth out loud, early — and your protagonist does not yet understand it',
                'it is a line of dialogue, not a moral: short, ordinary, easy to walk past',
                'they will only understand it by the end, which is what makes the ending land',
            ],
            ex: '*An Inspector Calls:* "We are members of one body. We are responsible for each other." Said in Act 3 — the Birlings spend the play failing to hear it.',
            more: [
                '*A Christmas Carol:* Fred insists Christmas has "done me good, and will do me good" — the truth Scrooge dismisses in scene one.',
                '*Animal Farm:* "All animals are equal" is stated at the start, and the whole book is what happens to it.',
                '*Of Mice and Men:* "Guys like us... are the loneliest guys in the world" — George says it in chapter one, and the rest of the book tests it.',
            ],
        },
        {
            id: 'false-identity', name: 'False Identity', nudge: true,
            val: 'neg',
            m: /false identity|anonymous|believes not worthy|unlikeable, inhumane|admirable, desirable/i,
            tech: [{ s: 'Dj', l: 'Duality' }, { s: 'Sy', l: 'Symbolism' }],
            crit: [
                'the MASK: who your protagonist pretends to be, or has been told they are',
                'show it in something external — a name, a uniform, a job, a room they keep a certain way',
            ],
            ex: '*Great Expectations:* Pip accepts the label "common labouring boy" and is ashamed of his own hands — the mask is put on him before he chooses it.',
            more: [
                '*Jekyll and Hyde:* Jekyll’s respectable public face is the mask, and the locked laboratory door is where he keeps it.',
                // v7.20.379 (#134): was Simba in the jungle — Stage III, not the Setup.
                '*Harry Potter:* Harry is "the boy in the cupboard", a label the Dursleys handed him so early he has never thought to question it.',
                '*An Inspector Calls:* Birling wears the self-made public man — the port, the cigars, the knighthood he expects is coming.',
            ],
        },
        {
            id: 'foreshadow', name: 'Foreshadowing', nudge: true,
            val: 'neg',
            m: /foreshadow/i,
            tech: [{ s: 'Fo', l: 'Foreshadowing' }, { s: 'Ck', l: 'Setup & Payoff' }],
            crit: [
                'PLANT something now that PAYS OFF later — an object, a phrase, a person, a small warning',
                'it must look ordinary on first reading and obvious on second',
            ],
            ex: '*Of Mice and Men:* Candy’s old dog is shot because it is no longer any use — and the reader remembers it at the very end of the book.',
            more: [
                '*Romeo and Juliet:* Romeo says he fears "some consequence yet hanging in the stars" before he ever reaches the party.',
                '*Macbeth:* the witches’ "fair is foul, and foul is fair" tells you how every promise in the play will work.',
                '*A Christmas Carol:* Marley’s chain is described link by link — and Scrooge is told his own is already longer.',
            ],
        },
        {
            id: 'limited-awareness', name: 'Limited Awareness', nudge: false,
            val: 'neg',
            m: /limited awareness|naive|ignorant|disconnected|immaturity|lacking responsibility/i,
            // v7.20.378 (Neil, #131): was [Pr Protagonist, Ir In Medias Res]. In Medias Res is an
            // OPENING-ONLY device — it describes how a story STARTS, so on beat ~7 the student has
            // already opened and there is nothing left to decide (Neil, live: "in medias res is
            // really for when the story is right at the opening"). It moves to `opening-image`,
            // the one beat where that choice is actually live. This beat takes DRAMATIC IRONY
            // instead, which is precisely what "show what your protagonist does NOT know yet"
            // means: the reader sees it, the character does not. Symbol verified against
            // bin/cw6-prod-technique-symbols.txt; `Di` is already the chip on two other concepts.
            tech: [{ s: 'Pr', l: 'Protagonist' }, { s: 'Di', l: 'Dramatic Irony' }],
            crit: [
                'show what your protagonist does NOT know yet — about the world, or about themselves',
                'show it through a mistake or an assumption, never by telling us they are naive',
            ],
            // v7.20.379 (Neil, #134) — ALL FOUR examples replaced, including the original. Every
            // one of them was a LATE-story moment (Romeo believing Juliet dead is Act 5; Simba
            // fleeing is after the inciting incident; Pip's benefactor assumption forms in London;
            // Katniss on the Capitol is the whole trilogy). Each was a true instance of limited
            // awareness and all of them modelled the wrong point in the story for a Stage I beat
            // that sits BEFORE the inciting incident. Neil, live: "that would be true later on,
            // but not now." These four are all first-act moments.
            ex: '*The Lion King:* Simba thinks being king means nobody can tell him what to do — he has no idea the job is mostly responsibility.',
            more: [
                '*Romeo and Juliet:* Romeo is certain he is heartbroken over Rosaline, and just as certain no one has ever felt this before.',
                '*Great Expectations:* Pip believes "common" is simply a fact about him, and that Satis House is where better people live.',
                '*The Hunger Games:* Katniss assumes the reaping is something that happens TO her district, and that keeping her head down is a survival plan.',
            ],
        },
        {
            id: 'oppression', name: 'Oppression Over the Community', nudge: true,
            val: 'neg',
            m: /oppressive|casts shadow over|mistreat|dark figures|community suffers|shadow over the community/i,
            tech: [{ s: 'Sd', l: 'The Shadow' }, { s: 'Mc', l: 'Microcosm' }],
            crit: [
                'the pressure is not only on your protagonist — show it lying over EVERYONE around them',
                'one small detail standing for the whole: what people stopped doing, or learned not to say',
            ],
            ex: '*Animal Farm:* the hens’ eggs are taken and no animal argues, because arguing stopped being possible some time ago.',
            more: [
                '*The Hunger Games:* the whole of District 12 stands silent at the reaping, because grief has a schedule there.',
                '*Macbeth:* under his rule Scotland "sinks beneath the yoke" — the country itself is the victim.',
                '*Jane Eyre:* at Lowood the girls’ hair is cut off and their porridge arrives burnt, and nobody complains, because complaining has a price.',
            ],
        },
        {
            id: 'monster-distant', name: 'The Threat at a Distance', nudge: false,
            val: 'neg',
            m: /monster from a distance|its reputation|aware of the monster|dangers ahead|threat becomes visible/i,
            tech: [{ s: 'Sd', l: 'The Shadow' }, { s: 'Sz', l: 'Suspense' }],
            crit: [
                'we hear about the threat before we see it — rumour, evidence, a story someone tells',
                'the less you show, the larger it feels: withhold the thing itself',
            ],
            ex: '*Stranger Things:* Will vanishes and the lights behave strangely long before anything is seen — the town fills the gap with fear.',
            more: [
                '*Frankenstein:* Walton’s crew glimpse a huge figure on the ice before we ever meet the creature.',
                '*Macbeth:* we hear the Captain describe Macbeth carving his way through the battle before Macbeth ever walks on stage.',
                '*Jekyll and Hyde:* Enfield’s story of a man calmly trampling a child is all we are given of Hyde for chapters.',
            ],
        },
        {
            id: 'gratification', name: 'Harmful Gratification', nudge: false,
            val: 'neg',
            m: /gratification/i,
            tech: [{ s: 'Fw', l: 'The Flaw' }, { s: 'Az', l: 'Antihero' }],
            crit: [
                'the thing they reach for that FEELS like relief and is actually the problem',
                'a specific habit or indulgence, shown once, without judgement in the narration',
            ],
            ex: '*Jekyll and Hyde:* Jekyll drinks the draught because being Hyde is a holiday from being respectable.',
            more: [
                '*A Christmas Carol:* Scrooge counts his money at night, alone, and it warms him more than the fire.',
                // v7.20.379 (#134): was Pip in London and Macbeth's second visit to the witches —
                // both well past the Setup. These two are first-act.
                '*Romeo and Juliet:* Romeo shuts himself in a dark room over Rosaline, because nursing the heartbreak is more comfortable than getting over it.',
                '*Lord of the Flies:* the boys spend the first afternoon swimming and rolling rocks off the mountain, rather than building the shelters.',
            ],
        },
        {
            id: 'object-of-desire', name: 'The Object of Desire', nudge: true,
            val: 'neu',
            m: /object of desire|focused on this object/i,
            tech: [{ s: 'Mk', l: 'MacGuffin' }, { s: 'Sy', l: 'Symbolism' }],
            crit: [
                'ONE thing your protagonist fixes on — it can be small, but it must be specific and visible',
                'the object should MEAN something: what does wanting it say about them?',
            ],
            ex: '*Of Mice and Men:* the farm with the rabbits — a few acres standing for every kind of safety the two men will never have.',
            more: [
                '*Great Expectations:* Estella, who Pip wants because she is everything he has been told he is not.',
                '*The Lion King:* being king — which, to a cub, mostly means nobody telling him what to do.',
                '*A Christmas Carol:* the coins in the strongbox — the one thing Scrooge can count that has never disappointed him.',
            ],
        },
        {
            id: 'warning-ignored', name: 'The Warning Ignored', nudge: false,
            val: 'neg',
            m: /sign or warning|ignores this warning|receives sign|urging him to change/i,
            tech: [{ s: 'Fo', l: 'Foreshadowing' }, { s: 'Di', l: 'Dramatic Irony' }],
            crit: [
                'someone or something WARNS them, clearly, and they wave it away',
                'the reader should see it; your protagonist should not',
            ],
            ex: '*A Christmas Carol:* Marley’s ghost shows Scrooge the chain he is forging, and Scrooge blames the cheese he ate.',
            more: [
                '*Macbeth:* Banquo warns that the witches may "win us with honest trifles, to betray’s in deepest consequence".',
                '*Romeo and Juliet:* Friar Laurence warns that "these violent delights have violent ends", and Romeo hears only the wedding.',
                // v7.20.379 (#134): was the Walton frame — the whole novel. This one is chapter two.
                '*Frankenstein:* Victor’s father glances at the Agrippa and calls it "sad trash" without explaining why — and Victor says later that a real explanation would have stopped him.',
            ],
        },
        {
            id: 'call-to-adventure', name: 'The Call', nudge: false,
            val: 'pos',
            m: /call to adventure|experiences a call|given supernatural|visionary direction|only he\/she can solve|calls or sends protagonist|inciting incident/i,
            tech: [{ s: 'Ii', l: 'Inciting Incident' }, { s: 'Hr', l: 'Herald' }],
            crit: [
                'a single event on a particular day that makes the old life impossible to continue',
                'it arrives from OUTSIDE — someone brings it, something happens; they do not decide it',
            ],
            ex: '*Harry Potter:* Hagrid arrives with a letter and tells Harry he is a wizard — the cupboard is over.',
            more: [
                '*A Christmas Carol:* Marley’s ghost walks through the door dragging chains of cash-boxes.',
                '*Frankenstein:* Victor sees the spark of life take hold, and there is no version of his old life after it.',
                '*The Hunger Games:* Prim’s name is read out at the reaping — one name, and the old life is finished.',
            ],
        },
        {
            id: 'sees-way-to-fix', name: 'A Way to Fix It', nudge: false,
            val: 'neu',
            m: /sees a way to fix|sees a way|way to fix it/i,
            tech: [{ s: 'Tu', l: 'Turning Point' }],
            crit: [
                'the PLAN, as your protagonist first imagines it — and it should be too simple to work',
                'a decision plus an action, not a feeling',
            ],
            ex: '*The Hunger Games:* Katniss volunteers in Prim’s place, because taking her sister’s ticket is the only lever she has.',
            more: [
                '*Great Expectations:* Pip decides that becoming a gentleman will solve the problem of being Pip.',
                '*Macbeth:* kill Duncan tonight, while he is sleeping under their own roof — one night’s work and the crown is theirs.',
                '*Lord of the Flies:* Ralph’s plan is a fire on the mountain — keep it lit and a ship will come.',
            ],
        },
        {
            id: 'general-goal', name: 'The Everyday Goal', nudge: false,
            val: 'neu',
            m: /goal here is general|something normal/i,
            tech: [{ s: 'Pr', l: 'Protagonist' }],
            crit: [
                'what they were trying to do BEFORE the story — small, ordinary, unglamorous',
                'get through a shift, pass a test, avoid a person, keep something quiet',
            ],
            ex: '*An Inspector Calls:* Mr Birling’s goal is a knighthood and a good year for the business — nothing more.',
            more: [
                '*Of Mice and Men:* George’s goal is to get through the bucking season with the pay in his pocket and Lennie out of trouble.',
                '*Harry Potter:* Harry’s goal is to get through the summer without the Dursleys noticing he exists.',
                '*Jane Eyre:* Jane’s goal at Thornfield is to teach one child well and keep the post.',
            ],
        },
        {
            id: 'world-deteriorates', name: 'The World Deteriorates', nudge: false,
            val: 'neg',
            m: /world deteriorates|increased awareness|need to change|increased awareness of need|sees more signs/i,
            tech: [{ s: 'Ra', l: 'Rising Action' }, { s: 'Tn', l: 'Tension' }],
            crit: [
                'things get measurably WORSE while your protagonist watches',
                'show a change your reader can compare against the opening — colder, emptier, louder',
            ],
            ex: '*Animal Farm:* the rations shrink, the hours grow, and the pigs move into the farmhouse — each step small, the direction unmistakable.',
            more: [
                '*Lord of the Flies:* the signal fire goes out, the shelters stay half-built, and fewer boys answer the conch.',
                '*Macbeth:* after the murder the horses turn on each other, an owl kills a falcon, and the day never gets light — the country curdles with him.',
                '*The Hunger Games:* the arena itself tightens: the Gamemakers set the woods alight to drive the tributes together.',
            ],
        },

        // ───────────────────────── STAGE II — DREAM ─────────────────────────
        {
            id: 'balance-deteriorates', name: 'The Balance Tips', nudge: false,
            val: 'neg',
            m: /opening balance deteriorates|tension begins to rise/i,
            tech: [{ s: 'Tn', l: 'Tension' }, { s: 'Pc', l: 'Pacing' }],
            crit: [
                'the steady life stops being steady — ONE thing that no longer works the way it did',
                'small and physical beats large and abstract here',
            ],
            ex: '*Romeo and Juliet:* the Capulets’ party ends, the guests leave, and two families now have a problem neither knows about yet.',
            more: [
                '*Stranger Things:* the search parties come back with nothing, and the adults start talking in another room.',
                '*An Inspector Calls:* the doorbell rings, mid-speech, while Birling is explaining that a man has to look after himself.',
                '*Jekyll and Hyde:* the draught stops being reliable — Jekyll wakes as Hyde without having taken it.',
            ],
        },
        {
            id: 'b-story', name: 'The B Story', nudge: false,
            val: 'neu',
            m: /b story/i,
            tech: [{ s: 'Sl', l: 'Subplot' }, { s: 'Th', l: 'Theme' }],
            crit: [
                'a SECOND relationship — usually with an ally — where the story’s truth gets discussed out loud',
                'they talk about something other than the plot, and it is really about the theme',
            ],
            ex: '*Of Mice and Men:* George and Candy talking about the farm — two men discussing whether hoping is worth it.',
            more: [
                '*Harry Potter:* Ron and Hermione, where Harry learns what having people actually involves.',
                '*A Christmas Carol:* Fred keeps inviting his uncle to dinner — a running argument about whether people are worth the trouble.',
                '*Great Expectations:* Herbert Pocket, who teaches Pip which fork to use and, without meaning to, what a gentleman actually is.',
            ],
        },
        {
            id: 'refusal', name: 'Refusing the Call', nudge: false,
            val: 'neg', pri: 1,
            m: /refuses the call|refuses again|weakness revealed|stuck in ordinary world/i,
            tech: [{ s: 'Fw', l: 'The Flaw' }, { s: 'Ie', l: 'Internal vs External Conflict' }],
            crit: [
                'they say NO — and the reason is the flaw, not the difficulty',
                'give the refusal an ACTION: they go back, put it down, close the door',
            ],
            ex: '*The Lion King:* Simba tells Nala he is not going back, and walks away from her into the jungle.',
            more: [
                '*Frankenstein:* Victor flees the room rather than look at what he has made.',
                '*A Christmas Carol:* Scrooge turns down Fred’s invitation and goes back to his ledger.',
                '*Macbeth:* Macbeth tells his wife "we will proceed no further in this business" — and it lasts one scene.',
            ],
        },
        {
            id: 'mentor', name: 'The Mentor', nudge: false,
            val: 'pos',
            m: /mentor/i,
            tech: [{ s: 'Mr', l: 'The Mentor' }, { s: 'Aa', l: 'Ally' }],
            crit: [
                'someone who has BEEN where your protagonist is going, and gives guidance rather than rescue',
                'they should be specific and flawed — a mentor who is simply wise is furniture',
            ],
            ex: '*A Christmas Carol:* the three spirits, who never tell Scrooge what to do — they only make him look.',
            more: [
                '*The Lion King:* Rafiki, who hits Simba with a stick before he explains anything.',
                '*Great Expectations:* Joe, whose mentoring is only ever by example, and Pip takes years to notice it.',
                '*The Hunger Games:* Haymitch, who is drunk before he is any use, and whose advice is mostly about being liked.',
            ],
        },
        {
            id: 'prophecy', name: 'The Prophecy', nudge: true,
            val: 'neg',
            m: /prophecy/i,
            tech: [{ s: 'Fo', l: 'Foreshadowing' }, { s: 'Wh', l: 'Withholding Information' }],
            crit: [
                'a promise about the future your protagonist BELIEVES — and it must be incomplete or double-edged',
                'the strongest prophecies come true in a way the character never meant',
            ],
            ex: '*Macbeth:* "none of woman born" shall harm him — true, and useless, because he hears it as safety.',
            more: [
                '*Romeo and Juliet:* the Prologue tells us they die in the first fourteen lines, and we watch anyway.',
                '*Frankenstein:* the creature promises "I will be with you on your wedding-night", and Victor assumes it means his own death.',
                '*Harry Potter:* the prophecy says neither can live while the other survives — and Voldemort makes it true by acting on it.',
            ],
        },
        {
            id: 'the-sword', name: 'The Gift (the "Sword")', nudge: true,
            val: 'pos',
            m: /presented with a sword|new clothes|receives crucial wisdom|apparent wisdom|ambiguous gifts/i,
            tech: [{ s: 'Mk', l: 'MacGuffin' }, { s: 'Sy', l: 'Symbolism' }],
            crit: [
                'a THING they are given — a tool, a token, a piece of knowledge, a set of clothes',
                'it stands for the new identity, so choose an object that means what the change means',
            ],
            ex: '*Harry Potter:* the wand chooses Harry in Ollivander’s — an object that says he belongs to this world.',
            more: [
                '*Cinderella:* the gown and glass slippers, which let her be SEEN as what she already is.',
                '*The Hunger Games:* Katniss is given the mockingjay pin — a small metal bird that ends up meaning rebellion.',
                '*The Lion King:* Rafiki shows Simba his own reflection in the water — not an object, but the thing he was given and could not use until now.',
            ],
        },
        {
            id: 'facade-goal', name: 'The Façade Goal', nudge: false,
            val: 'neg',
            m: /façade|facade|very simple problem/i,
            tech: [{ s: 'Dj', l: 'Duality' }, { s: 'Su', l: 'Subtext' }],
            crit: [
                'what they SAY they want at this stage — money, escape, revenge, a job, not being laughed at',
                'it is not the real need, and it should be almost embarrassingly practical',
            ],
            ex: '*Great Expectations:* Pip wants to stop being ashamed of his boots. That is genuinely the goal at this point.',
            more: [
                '*Jekyll and Hyde:* Jekyll wants his experiment to work, and tells himself that is all it is.',
                '*Macbeth:* the crown, wanted the way a man wants a promotion — the thing he can name and ask for.',
                '*The Lion King:* Simba says he wants to be king so that nobody can tell him what to do.',
            ],
        },
        {
            id: 'the-wound', name: 'The Wound', nudge: false,
            val: 'neg',
            m: /painful past experience|emotional wound|repressed emotional/i,
            tech: [{ s: 'Fb', l: 'Flashback' }, { s: 'Fw', l: 'The Flaw' }],
            crit: [
                'the older hurt the FLAW was built to cover — one event, not a mood',
                'it can be revealed in a line, a memory, or something they will not talk about',
            ],
            ex: '*A Christmas Carol:* the boy left alone at school every Christmas — the first spirit shows it, and the whole miser makes sense.',
            more: [
                '*The Lion King:* Mufasa dying while Simba watches, and being told it was his fault.',
                '*Great Expectations:* Miss Havisham stopped every clock at twenty to nine, and never left that day.',
                '*Jane Eyre:* the red room at Gateshead, where Jane is locked in as a child and left with her fear until she faints.',
            ],
        },
        {
            id: 'herald', name: 'The Herald', nudge: false,
            val: 'pos',
            m: /herald/i,
            tech: [{ s: 'Hr', l: 'Herald' }],
            crit: [
                'whoever BRINGS the news that moves your protagonist — they need not be important afterwards',
                'give them one vivid detail, then let them do their job',
            ],
            ex: '*Harry Potter:* Hagrid, who arrives soaked through with a birthday cake and changes everything.',
            more: [
                '*An Inspector Calls:* the doorbell, and then the Inspector — the news itself walking in.',
                '*Macbeth:* the witches on the heath, bearded and riddling, who deliver the news and then vanish into the air.',
                '*A Christmas Carol:* Marley, who arrives with a bandage tied round his head and unties it so his jaw drops onto his chest.',
            ],
        },
        {
            id: 'epiphany', name: 'Epiphany', nudge: true,
            val: 'pos',
            m: /epiphany|enlightened|genuine insight|deeper realisation/i,
            tech: [{ s: 'Ng', l: 'Anagnorisis' }, { s: 'Tu', l: 'Turning Point' }],
            crit: [
                'something CLICKS — your protagonist understands one thing they were blind to',
                'trigger it with something external and small: an object, an overheard line, a face',
                'they need not understand ALL of it yet; this is a step, not the ending',
            ],
            ex: '*A Christmas Carol:* Scrooge watches the Cratchits at their thin Christmas table and, for the first time, asks about Tiny Tim.',
            more: [
                '*Sheila in An Inspector Calls:* she works out that the girl in the photograph is the girl she had sacked, and never goes back to who she was.',
                '*The Lion King:* Rafiki shows Simba his reflection, and he sees Mufasa in it.',
                '*Of Mice and Men:* Candy, after his dog is carried out to be shot, works out that he should have done it himself — and says so out loud.',
            ],
        },
        {
            id: 'threshold', name: 'Crossing the Threshold', nudge: true,
            val: 'pos',
            m: /crosses the threshold|threshold|into the special world|set out across/i,
            tech: [{ s: 'Gd', l: 'Threshold Guardian' }, { s: 'Tu', l: 'Turning Point' }],
            crit: [
                'a PHYSICAL crossing — a door, a gate, a platform, a border, a first step onto something',
                'once across, going back is not simple; make that visible',
            ],
            ex: '*Harry Potter:* running at the barrier on Platform 9¾ — a wall you have to trust before it lets you through.',
            more: [
                '*Alice in Wonderland:* the fall down the rabbit hole, which is a threshold you cannot climb back up.',
                '*The Hunger Games:* the tube rising into the arena, and the countdown starting.',
                '*Jane Eyre:* Jane climbs onto the coach that takes her away from Lowood and is set down at Thornfield after dark — the only world she knows is now behind her.',
            ],
        },
        {
            id: 'glimpse-true-self', name: 'A Glimpse of the True Self', nudge: false,
            val: 'pos',
            m: /glimpse of (his\/her )?true self|glimpse of true self|warmer humanity|potential to change/i,
            tech: [{ s: 'Hn', l: 'Moment of Humanity' }, { s: 'Dj', l: 'Duality' }],
            crit: [
                'one moment where the mask slips and we see who they could be',
                'small kindness, unexpected skill, an honest sentence — then let the mask return',
            ],
            ex: '*A Christmas Carol:* Scrooge laughs at Fezziwig’s party — the first time we see he was once capable of joy.',
            more: [
                '*Lennie in Of Mice and Men:* offering to leave and live in a cave so George does not have to put up with him.',
                '*Macbeth:* "I dare do all that may become a man; who dares do more is none" — for one line he knows exactly where the limit is.',
                '*Great Expectations:* Pip secretly pays to set Herbert up in business and makes sure Herbert never learns who did it — the one thing he hides because it is generous.',
            ],
        },
        {
            id: 'stunning-surprise', name: 'The Stunning Surprise', nudge: false,
            val: 'neg',
            m: /stunning surprise|something shocking|another shock|destroys the plan/i,
            tech: [{ s: 'Tw', l: 'Surprise' }, { s: 'Pt', l: 'Plot Twist' }, { s: 'Ux', l: 'Subverted Expectation' }],
            crit: [
                'ONE event out of the blue that makes the current plan impossible',
                'it must be FAIR — the reader should be able to look back and see it was possible',
            ],
            ex: '*Great Expectations:* Magwitch walks in out of the rain, and Pip’s entire idea of where his money came from collapses.',
            more: [
                '*An Inspector Calls:* Eric walks in just after his mother has demanded that the father of the child be punished — she has condemned her own son.',
                '*Romeo and Juliet:* Tybalt kills Mercutio in the street, and the play stops being a comedy in one stroke.',
                '*The Hunger Games:* the rule changes mid-Games — two tributes from one district may win — and Katniss immediately goes looking for Peeta.',
            ],
        },
        {
            id: 'allies', name: 'The Allies', nudge: false,
            val: 'pos',
            m: /allies|companions|ally appears|small group/i,
            tech: [{ s: 'Aa', l: 'Ally' }, { s: 'Fl', l: 'Foil' }],
            crit: [
                'who joins them — and each ally should be GOOD at something your protagonist is not',
                'two or three, sharply different from each other, is stronger than a crowd',
            ],
            ex: '*Harry Potter:* Ron gives him a family and Hermione gives him a brain — neither is a copy of Harry.',
            more: [
                '*Stranger Things:* the boys, Eleven, Nancy and Hopper all hunt the same thing with completely different tools.',
                '*The Lion King:* Timon and Pumbaa, who are no use at all in a fight and are the only reason Simba lives long enough to have one.',
                '*The Hunger Games:* Rue, who can read the arena’s trees, and Cinna, who can read its audience — neither skill is Katniss’s.',
            ],
        },
        {
            id: 'physical-attack', name: 'The First Attack', nudge: false,
            val: 'neg',
            m: /physical attack|receives a warning|suffers a|attacked again|resistance does not work/i,
            tech: [{ s: 'Cf', l: 'Conflict' }, { s: 'Sk', l: 'Stakes' }],
            crit: [
                'the opposition touches them for the first time — and your protagonist LOSES',
                'losing here is the point: it proves the goal is not free',
            ],
            ex: '*The Hunger Games:* the first night in the arena, hiding in a tree while a pack of Careers hunts below.',
            more: [
                '*Frankenstein:* the creature kills William, and Victor understands what he has released.',
                '*Lord of the Flies:* the hunters let the signal fire go out and a ship passes the island — the first real loss, and Ralph can do nothing about it.',
                '*Great Expectations:* Estella is told to play cards with Pip, calls him coarse and common, and he goes outside to cry about his own hands.',
            ],
        },
        {
            id: 'dark-force-rising', name: 'The Dark Force Rising', nudge: false,
            val: 'neg',
            m: /dark force|rise to power|consequences if they do not change|reminds protagonist of need/i,
            tech: [{ s: 'Sd', l: 'The Shadow' }, { s: 'Ra', l: 'Rising Action' }],
            crit: [
                'the opposition GROWS while your protagonist hesitates — show its reach widening',
                'one concrete gain: a place taken, a person turned, a rule changed',
            ],
            ex: '*Animal Farm:* Napoleon acquires the dogs, and after that the votes stop mattering.',
            more: [
                '*Macbeth:* the murders multiply and the court empties — his power grows as his support drains.',
                '*The Lion King:* the hyenas move into the Pride Lands and the herds leave — Scar’s reach measured in empty grass.',
                '*Stranger Things:* the lab widens its reach — phones tapped, a body faked, the town’s own police told to stop looking.',
            ],
        },

        // ───────────────────── STAGE III — FASCINATION ─────────────────────
        {
            id: 'special-world', name: 'The Special World', nudge: false,
            val: 'pos',
            m: /excited or fascinated by the new world/i,
            tech: [{ s: 'Wb', l: 'Secondary World' }, { s: 'Se', l: 'Setting' }],
            crit: [
                'the new world through your protagonist’s eyes — WONDER first, unease underneath',
                'three concrete details beat a paragraph of description: what is strange here that is normal to everyone else?',
            ],
            ex: '*Harry Potter:* Diagon Alley, where the wonder is total and nobody explains anything — Harry is delighted and completely out of his depth.',
            more: [
                '*Cinderella:* the ball, where for one night she is treated as though she has always belonged.',
                '*Voyage and Return stories:* Oz in colour after Kansas in grey — beautiful, and not on her side.',
                '*The Hunger Games:* the Capitol — food arriving up a lift, people with dyed skin, and everyone delighted to meet a girl they intend to watch die.',
            ],
        },
        {
            id: 'betrayal', name: 'The Betrayal', nudge: false,
            val: 'neg',
            m: /betray/i,
            tech: [{ s: 'Sw', l: 'Shapeshifter' }, { s: 'Pt', l: 'Plot Twist' }],
            crit: [
                'someone TRUSTED turns — and their reason should make sense from where they stand',
                'the betrayal must cost your protagonist something specific',
            ],
            ex: '*Animal Farm:* Squealer, who was there for every promise and rewrites each one.',
            more: [
                '*Macbeth:* Macbeth betrays Duncan, who has just called him "worthiest cousin" and given him a title.',
                '*The Lion King:* Scar holds his brother at the edge of the gorge, says "long live the king", and lets go.',
                '*Great Expectations:* Miss Havisham lets Pip believe for years that she is his benefactor, because his hope is useful to her.',
            ],
        },
        {
            id: 'underworld', name: 'Into the Underworld', nudge: true,
            val: 'neg',
            m: /underworld|inmost cave|deepest fears|inner demons/i,
            tech: [{ s: 'Ml', l: 'Mental Landscape' }, { s: 'Sy', l: 'Symbolism' }],
            crit: [
                'a DARK PLACE they go down into — a cellar, a tunnel, a night, a hospital, a forest',
                'the place should look like the fear: let the setting do the psychology',
            ],
            ex: '*Harry Potter:* the trapdoor beneath the trick step, and everything under the school it leads to.',
            more: [
                '*Jekyll and Hyde:* Soho at night, and the locked dissecting-room where Jekyll keeps the other half of himself.',
                '*Great Expectations:* the sluice-house on the marshes, in the dark, alone with Orlick.',
                '*Frankenstein:* the charnel-houses and dissecting rooms where Victor collects his materials by candlelight.',
            ],
        },
        {
            id: 'elixir', name: 'The Elixir', nudge: true,
            val: 'pos',
            m: /elixir/i,
            tech: [{ s: 'Mk', l: 'MacGuffin' }, { s: 'Sy', l: 'Symbolism' }],
            crit: [
                'the thing that will save them LATER — given now, and not yet understood',
                'it can be an object, a lesson, or a person’s loyalty; it must be plantable and payable',
            ],
            ex: '*Harry Potter:* his mother’s protection, mentioned early and only useful in the final room.',
            more: [
                '*The Hunger Games:* the nightlock berries — picked up as food, used as a weapon.',
                '*Of Mice and Men:* George’s story about the farm, told so often that Lennie can hear it one last time without knowing why.',
                '*The Lion King:* Mufasa’s lesson about the great kings in the stars, given to a cub who has no use for it yet.',
            ],
        },
        {
            id: 'false-dawn', name: 'The False Dawn', nudge: false,
            val: 'pos',
            m: /all seems to be going well|all may seem to go well|immune from danger|getting away with it|seems to be winning|threat recedes|comfortable and immune/i,
            tech: [{ s: 'Ux', l: 'Subverted Expectation' }, { s: 'Di', l: 'Dramatic Irony' }],
            crit: [
                'a stretch where it WORKS — real success, not a fake one',
                'let the reader relax; put one small wrong detail in the corner of the picture',
            ],
            ex: '*Animal Farm:* the windmill goes up, the harvest is good, and the animals sing — while the pigs are already drinking milk.',
            more: [
                '*Macbeth:* he is crowned, the banquet is laid, and Banquo’s murderer is at the door.',
                '*The Hunger Games:* Katniss and Rue destroy the Careers’ supplies, and for one night the alliance is actually working.',
                '*Great Expectations:* Pip in London with money, rooms and a servant — everything he asked for, and Joe standing awkwardly in the doorway.',
            ],
        },
        {
            id: 'storm-coming', name: 'A Storm is Coming', nudge: true,
            val: 'neg',
            m: /a storm is coming|onset of evil|something threatening|shadow begins to intrude/i,
            tech: [{ s: 'Pf', l: 'Pathetic Fallacy' }, { s: 'Md', l: 'Mood' }],
            crit: [
                'ATMOSPHERE, not event — weather, light, sound, an animal behaving oddly',
                'nothing has happened yet; the reader should simply not want to turn the page',
            ],
            ex: '*Macbeth:* the night Duncan dies, chimneys are blown down, horses eat each other and an owl kills a falcon.',
            more: [
                '*Jane Eyre:* the chestnut tree is split by lightning the night Rochester proposes.',
                '*Lord of the Flies:* the heat presses down and thunder builds for pages before Simon dies.',
                '*Frankenstein:* lightning over the mountains outside Geneva, and a shape moving between the flashes.',
            ],
        },
        {
            id: 'mood-turns', name: 'The Mood Turns', nudge: false,
            val: 'neg',
            m: /mood changes|things (begin to |continue to )?go wrong|going downhill|frustrat|begins to feel/i,
            tech: [{ s: 'Md', l: 'Mood' }, { s: 'Ta', l: 'Tone' }],
            crit: [
                'the FEEL of the story shifts from excitement to grind — show it in what a day is like now',
                'compare against an earlier scene so the reader can measure the drop',
            ],
            ex: '*Lord of the Flies:* meetings that were exciting become arguments nobody attends, and the beach stops being a holiday.',
            more: [
                '*Of Mice and Men:* the farm talk gets quieter each time it comes up, and George stops finishing the sentence.',
                '*Animal Farm:* "Beasts of England" is banned, the rations shrink again, and the animals work longer for less.',
                '*An Inspector Calls:* the celebration never restarts — same room, same people, and nobody sits back down.',
            ],
        },
        {
            id: 'obstacles', name: 'Rising Obstacles', nudge: false,
            val: 'neg',
            m: /obstacles|crises|temptations|monsters|tests|experimenting and learning/i,
            tech: [{ s: 'Ra', l: 'Rising Action' }, { s: 'Cf', l: 'Conflict' }],
            crit: [
                'each obstacle HARDER than the last — escalation is the whole job of this stage',
                'give one concrete example rather than a list; a named difficulty beats "many problems"',
            ],
            ex: '*Harry Potter:* Fluffy, then the Devil’s Snare, then the keys, then the chess board — each one costs more than the last.',
            more: [
                '*The Hunger Games:* the tracker jackers, then the fire, then the mutts — the arena keeps raising the price.',
                '*Macbeth:* Banquo, then Fleance escaping, then Macduff gone to England — every answer he finds makes a bigger problem.',
                '*Great Expectations:* hiding Magwitch, then moving him, then the river and the customs boat — each step costs more than the last.',
            ],
        },
        {
            id: 'villain-advances', name: 'The Opposition Advances', nudge: false,
            val: 'neg',
            m: /advances like a bulldozer|villain advances|monster advances|opposition advances|demonstrates his power|demonstrate their power|demonstrates its power/i,
            tech: [{ s: 'Ax', l: 'Antagonist' }, { s: 'Nm', l: 'Nemesis' }],
            crit: [
                'show the antagonist WINNING something — not threatening, actually taking',
                'their competence is what makes your protagonist’s victory worth anything',
            ],
            ex: '*Macbeth:* the murderers reach Macduff’s castle and kill his wife and children while he is out of the country.',
            more: [
                '*Frankenstein:* the creature kills Clerval, and Victor understands that everyone he loves is a target.',
                '*Lord of the Flies:* Jack takes the fire, then Piggy’s glasses, then the conch — and everything he takes, he keeps.',
                '*Stranger Things:* the lab takes Barb, and the town is handed a story that explains her away.',
            ],
        },
        {
            id: 'guidance', name: 'Rest and Guidance', nudge: false,
            val: 'pos',
            m: /periods of rest|advice from mentors|gives guidance|shows him the consequences|contact spirits|has faith/i,
            tech: [{ s: 'Mr', l: 'The Mentor' }, { s: 'Pc', l: 'Pacing' }],
            crit: [
                'a QUIET beat — your reader needs to breathe, and your protagonist needs a conversation',
                'the guidance should be a question or an example, never an instruction',
            ],
            ex: '*Of Mice and Men:* Slim listening in the bunkhouse, saying almost nothing, and George telling him the truth about Weed.',
            more: [
                '*A Christmas Carol:* the Ghost of Christmas Present answers Scrooge with his own words: "Are there no prisons?"',
                '*The Lion King:* Rafiki does not tell Simba to go back — he asks him who he is, and then waits.',
                '*Jane Eyre:* Helen Burns at Lowood, taking her punishment without complaint — she teaches Jane by example, never by instruction.',
            ],
        },
        {
            id: 'approach', name: 'Within Sight of the Goal', nudge: false,
            val: 'neu',
            m: /within sight of goal|arrives within|approach to|preparations|becomes committed|goal becomes much more specific/i,
            tech: [{ s: 'Ra', l: 'Rising Action' }, { s: 'Tn', l: 'Tension' }],
            crit: [
                'the goal becomes VISIBLE and specific — and the last stretch is the worst',
                'show preparation: what they gather, decide, or give up before going in',
            ],
            ex: '*The Hunger Games:* the announcement that two tributes from one district may win, and Katniss going to find Peeta.',
            more: [
                '*Harry Potter:* the three of them agreeing to go through the trapdoor tonight, because tomorrow is too late.',
                '*Macbeth:* the bell rings, and Macbeth walks up the stairs to the chamber where Duncan is sleeping — the last moment he could still turn round.',
                '*Great Expectations:* the boat is hired and the tide is checked — everything ready to take Magwitch down the river.',
            ],
        },
        {
            id: 'powerless', name: 'Losing Hold of the Old Self', nudge: false,
            val: 'neg',
            m: /seems powerless|terrible and disgusted|letting go of old self|more open to change|seems tiny and alone/i,
            tech: [{ s: 'Dj', l: 'Duality' }, { s: 'Ie', l: 'Internal vs External Conflict' }],
            crit: [
                'the mask starts costing more than it protects — show them CAUGHT between the two selves',
                'an action, not a reflection: something they cannot make themselves do any more',
            ],
            ex: '*Jekyll and Hyde:* Jekyll wakes as Hyde without taking the draught, and knows the choice has left his hands.',
            more: [
                '*Great Expectations:* Pip is ashamed of being ashamed of Joe, and still does not write to him.',
                '*Macbeth:* he cannot say "Amen" — the word will not come, and he knows exactly what that means.',
                '*The Lion King:* Simba cannot answer Nala when she asks who he is, so he changes the subject.',
            ],
        },
        {
            id: 'ticking-clock', name: 'The Ticking Clock', nudge: false,
            val: 'neg',
            m: /time is running out|closing in/i,
            tech: [{ s: 'Tc', l: 'Ticking Clock' }, { s: 'Pc', l: 'Pacing' }],
            crit: [
                'a DEADLINE the reader can count down — sunrise, a train, a trial, a tide',
                'once you set it, refer to it: every scene should spend some of it',
            ],
            ex: '*Romeo and Juliet:* the friar’s plan runs on a sleeping potion and a letter, and both are on a clock.',
            more: [
                '*A Christmas Carol:* one night, three spirits, and Christmas morning as the hard edge.',
                '*The Hunger Games:* the feast at the Cornucopia — one time, one place, and Peeta dies without the medicine.',
                '*Macbeth:* Banquo has to be dead before the banquet, and the murderers are given until dusk.',
            ],
        },

        // ───────────────────── STAGE IV — NIGHTMARE ─────────────────────
        {
            id: 'lowest-point', name: 'The Lowest Point (Dark Night)', nudge: true,
            val: 'neg',
            m: /lowest point|despair|retreats to false identity|out of control|compelled to run away|compelled to commit dark acts|things will never be the same/i,
            tech: [{ s: 'Dk', l: 'Dark Night' }, { s: 'Ml', l: 'Mental Landscape' }],
            crit: [
                'the goal looks LOST and the mask goes back on — this is the bottom, not a setback',
                'strip them of the ally, object or belief they have leaned on all story',
                'nothing is solved here; the change has to be EARNED out of this, later',
            ],
            ex: '*Macbeth:* told of his wife’s death, he calls life "a tale told by an idiot, signifying nothing" — the ambition has bought him emptiness.',
            more: [
                '*The Lion King:* Simba refuses to go home while the Pride Lands starve, choosing guilt over responsibility.',
                '*Great Expectations:* Pip, in debt and ill, learns his fortune came from a convict and Estella has married Drummle.',
                '*Of Mice and Men:* Lennie waiting in the brush by the river, and George walking towards him with Carlson’s pistol.',
            ],
        },
        {
            id: 'nightmare-battle', name: 'The Nightmare Battle', nudge: true,
            val: 'neg',
            m: /nightmare battle|supreme ordeal|final .*(battle|ordeal) approaches|battle to defeat the old self|face to face with the monster|awesome power/i,
            tech: [{ s: 'Cl', l: 'Climax' }, { s: 'Ie', l: 'Internal vs External Conflict' }],
            crit: [
                'the fight is against the OLD SELF as much as the enemy — make both visible in one event',
                'the external danger should force the internal choice; do not separate them',
            ],
            ex: '*Frankenstein:* Victor chases the creature across the ice, and the pursuit is indistinguishable from him pursuing himself.',
            more: [
                '*Lord of the Flies:* the hunt for Ralph, where the thing hunting him is the boys he arrived with.',
                '*Jekyll and Hyde:* the last night in the cabinet, where Jekyll fights to stay Jekyll and loses by morning.',
                '*Macbeth:* facing Macduff, he learns the prophecy was a trick and fights anyway — the ambition that ruined him is the last thing he has.',
            ],
        },
        {
            id: 'allies-disagree', name: 'The Allies Break', nudge: false,
            val: 'neg',
            m: /allies disagree|separated from what|allies abandon|obstacles, crises with those once close/i,
            tech: [{ s: 'Cf', l: 'Conflict' }, { s: 'Fl', l: 'Foil' }],
            crit: [
                'the group SPLITS, and each side should be arguably right',
                'your protagonist ends up more alone than they were — show the moment it happens',
            ],
            ex: '*Lord of the Flies:* the tribe divides at the pig roast, and Ralph is left with Piggy and the conch nobody obeys.',
            more: [
                '*An Inspector Calls:* the family turns on itself once the Inspector leaves, the parents against the children.',
                '*Animal Farm:* Snowball and Napoleon split the farm over the windmill, and each side can argue it is right.',
                '*Harry Potter:* Ron walks out — the friend who was there first, gone, and Harry left with the harder half of the job.',
            ],
        },
        {
            id: 'cornered', name: 'Cornered', nudge: false,
            val: 'neg',
            m: /cornered the protagonist|only one outcome|serious threat to hero|threat to hero's survival|shadow's clutches|monster's clutches|may fall into/i,
            tech: [{ s: 'Sk', l: 'Stakes' }, { s: 'Sz', l: 'Suspense' }],
            crit: [
                'close every exit — the reader should not be able to see a way out either',
                'name the cost of losing, in one specific thing they will not get back',
            ],
            ex: '*The Hunger Games:* Katniss up the tree with the Careers camped below and no water left.',
            more: [
                '*Macbeth:* Dunsinane surrounded, the wood moving, and every prophecy turning out to be a trap.',
                '*Jekyll and Hyde:* the original salt runs out, and there is no more of it to be had anywhere in London.',
                '*Great Expectations:* the boat is stopped on the river, Compeyson is aboard, and there is nowhere left to take Magwitch.',
            ],
        },
        {
            id: 'shadow-dominates', name: 'The Shadow Dominates', nudge: false,
            val: 'neg',
            m: /begins to dominate|powerful forces unleashed|shadowy figure|dark power/i,
            tech: [{ s: 'Sd', l: 'The Shadow' }, { s: 'Md', l: 'Mood' }],
            crit: [
                'the opposition is now the STRONGEST thing in your story — show its reach, not its intentions',
                'give one image of the world under it: what has been shut, emptied or replaced',
            ],
            ex: '*Animal Farm:* the pigs walk on two legs and the sheep bleat the new slogan — the takeover is complete and nobody resists.',
            more: [
                '*Stranger Things:* the gate is open, the vines are in the tunnels, and the town is standing on top of it.',
                '*The Lion King:* the Pride Lands under Scar — no rain, no herds, bones in the grass and hyenas in the throne room.',
                '*Macbeth:* a Scotland where "good men’s lives expire before the flowers in their caps", and nobody dares say the king’s name.',
            ],
        },
        {
            id: 'greater-crises', name: 'Greater Crises', nudge: false,
            val: 'neg', pri: 1,
            m: /greater crises|everything suddenly goes wrong|suddenly realises/i,
            tech: [{ s: 'Ra', l: 'Rising Action' }, { s: 'Pc', l: 'Pacing' }],
            crit: [
                'stack the failures — the plan collapses, and each collapse makes the next one worse',
                'shorten the gaps: this is where the story should feel fast',
            ],
            ex: '*Romeo and Juliet:* the letter never arrives, Balthasar brings the wrong news, and Romeo buys poison — three failures in a row, no time between them.',
            more: [
                '*Jekyll and Hyde:* the transformations come uninvited, the salt runs out, and the door stays locked.',
                '*Lord of the Flies:* the fire is stolen, then Piggy’s glasses, then the conch is smashed and Piggy with it — each failure feeding the next.',
                '*Frankenstein:* William, then Justine, then Clerval, then Elizabeth — each death arriving faster than Victor can prevent the one after it.',
            ],
        },

        // ───────────────────── STAGE V — FINAL PUSH ─────────────────────
        {
            id: 'reversal', name: 'The Reversal', nudge: true,
            val: 'pos',
            m: /reversal|brings protagonist back to life|comes back from (the )?dead|comes back from dead/i,
            tech: [{ s: 'Rv', l: 'Peripeteia' }, { s: 'Dx', l: 'Deus Ex Machina' }],
            crit: [
                'your protagonist gets back UP — and it must come from something PLANTED earlier',
                '⚠ the trap: rescue by luck or by a new character reads as cheating (deus ex machina). Pay off an ally, an object or a lesson your reader already met.',
            ],
            ex: '*The Lion King:* Rafiki and Mufasa’s memory bring Simba back — both established long before they are needed.',
            more: [
                '*Harry Potter:* the protection of his mother’s love, mentioned in chapter one, is what saves him in the last room.',
                '*A Christmas Carol:* Scrooge is not rescued at all — the grave is what lifts him, which is why it works.',
                '*The Hunger Games:* the nightlock berries, picked up early as nothing much, turn a rigged ending into a choice the Capitol cannot afford.',
            ],
        },
        {
            id: 'new-information', name: 'New Information', nudge: false,
            val: 'pos',
            m: /new information|second catalyst|choice to continue/i,
            tech: [{ s: 'Nw', l: 'Fresh News' }, { s: 'Tu', l: 'Turning Point' }],
            crit: [
                'one FACT arrives that makes going on possible — and it forces a choice, not a feeling',
                'the choice should cost something: they continue knowing what it will take',
            ],
            ex: '*Macbeth:* he learns Macduff was not "of woman born" — new information, and the choice to fight anyway.',
            more: [
                '*The Hunger Games:* the rule change is revoked, and Katniss decides what to do with the berries.',
                '*The Lion King:* Simba hears Scar admit he killed Mufasa — the guilt he had carried for years was never his to carry.',
                '*Great Expectations:* Pip learns whose daughter Estella really is, and chooses to give the fact to a dying man rather than keep it.',
            ],
        },
        {
            id: 'seizes-sword', name: 'Seizing the Sword', nudge: true,
            val: 'pos',
            m: /seizes the sword|accepts new identity|steps beyond false identity|discovers his\/her own true power|discovers his|true power/i,
            tech: [{ s: 'Sy', l: 'Symbolism' }, { s: 'Dj', l: 'Duality' }],
            crit: [
                'the mask comes OFF for good — and the moment should be visible, not internal',
                'use the object or name from earlier: they pick it up, put it on, or claim it out loud',
            ],
            ex: '*The Lion King:* Simba climbs Pride Rock and roars — taking the name he had spent the film refusing.',
            more: [
                '*Jane Eyre:* she walks back into Ferndean with her own fortune and tells the blinded Rochester she is an independent woman now — she comes back as an equal, not a governess.',
                '*Cinderella:* she produces the second slipper, having been the same person the whole time.',
                '*A Christmas Carol:* Scrooge throws the window open on Christmas morning and shouts down to a boy in the street.',
            ],
        },
        {
            id: 'surpasses-mentor', name: 'Surpassing the Mentor', nudge: false,
            val: 'neu', pri: 1,
            m: /surpasses the mentor|surpasses the dark mentor|mentor sacrifices|mentor fights|mentor dies/i,
            tech: [{ s: 'Mr', l: 'The Mentor' }, { s: 'Ck', l: 'Setup & Payoff' }],
            crit: [
                'the mentor must be OUT of the way for the final test — dead, defeated, absent or simply wrong',
                'your protagonist then does the thing the mentor could not',
            ],
            ex: '*Harry Potter:* Dumbledore is deliberately away, so Harry faces the last room without him.',
            more: [
                '*The Lion King:* Mufasa is long dead; Simba has to be the one who says "I am".',
                '*A Christmas Carol:* the third spirit never speaks a word — Scrooge has to do the reading himself.',
                '*Great Expectations:* Joe never asks Pip for anything, so Pip has to work the debt out alone and go back to pay it.',
            ],
        },
        {
            id: 'self-sacrifice', name: 'Willing to Sacrifice', nudge: true,
            val: 'pos',
            m: /willing to sacrifice|sacrifice for others|decides to die with honour/i,
            tech: [{ s: 'Hn', l: 'Moment of Humanity' }, { s: 'Ct', l: 'Catharsis' }],
            crit: [
                'they give up the thing they wanted MOST — and the giving-up must be a choice, made on the page',
                'this is the proof of the change: what they surrender is what the flaw was protecting',
            ],
            ex: '*A Christmas Carol:* Scrooge spends his money on other people — the one thing the whole book said he would never do.',
            more: [
                '*The Hunger Games:* Katniss offers to die with Peeta rather than win by killing him.',
                '*Of Mice and Men:* George does the hardest possible thing for Lennie rather than let the mob reach him.',
                '*The Lion King:* Simba gives up the jungle life he genuinely liked and walks back into the thing he was most afraid of.',
            ],
        },
        {
            id: 'villain-weakness', name: 'The Antagonist’s Weakness', nudge: false,
            val: 'pos',
            m: /understands the .*weakness|weakness/i,
            tech: [{ s: 'Ax', l: 'Antagonist' }, { s: 'Nm', l: 'Nemesis' }],
            crit: [
                'your protagonist WORKS OUT the flaw in the opposition — from something they saw earlier',
                'the weakness should be the antagonist’s strength taken too far',
            ],
            ex: '*Macbeth:* his certainty in the prophecies is exactly what Malcolm’s army uses against him.',
            more: [
                '*Animal Farm:* the pigs’ weakness is that the rules keep having to be repainted — and someone is always awake to see it.',
                '*The Hunger Games:* the Capitol’s weakness is that it needs an audience, so Katniss plays to the cameras instead of to the arena.',
                '*Lord of the Flies:* Jack’s hold depends entirely on the show — the paint, the chant, the dance — and it collapses the second an adult is standing on the beach.',
            ],
        },
        {
            id: 'villain-accuses', name: '"You Are the Same as Me"', nudge: true,
            val: 'neg',
            m: /accuses protagonist of being the same|not fooled|accuses opponents|opponent does not listen/i,
            tech: [{ s: 'Fl', l: 'Foil' }, { s: 'Dj', l: 'Duality' }],
            crit: [
                'the antagonist claims your protagonist is no different from them — and it should be PARTLY TRUE',
                'your protagonist’s answer is an action, not an argument: they prove the difference by what they do next',
            ],
            ex: '*Frankenstein:* the creature tells Victor they are bound together and equally guilty — and the book never quite disagrees.',
            more: [
                '*An Inspector Calls:* the Inspector puts the whole family in the same sentence, and only Sheila and Eric accept it.',
                '*The Lion King:* Scar tells Simba he is a murderer just like him — and Simba has believed exactly that for years.',
                '*Jekyll and Hyde:* Hyde is not a stranger arguing with Jekyll; the final confession admits they were one person the whole time.',
            ],
        },
        {
            id: 'nick-of-time', name: 'In the Nick of Time', nudge: false,
            val: 'pos',
            m: /nick of time|struggles to escape|thrilling escape/i,
            tech: [{ s: 'Tc', l: 'Ticking Clock' }, { s: 'Pc', l: 'Pacing' }],
            crit: [
                'the escape or the win lands with NOTHING to spare — cash in the deadline you set earlier',
                'short sentences here; let the pace do the work',
            ],
            ex: '*The Hunger Games:* the berries are at their lips when the Capitol gives in — one second later and there is no book two.',
            more: [
                '*Harry Potter:* Harry gets the Stone as Quirrell reaches him, and passes out in the same breath.',
                '*A Christmas Carol:* Scrooge wakes and finds it is still Christmas Day — the one morning he had left to use.',
                '*Great Expectations:* Pip reaches the sluice-house as Orlick raises the hammer, and Herbert is one step behind him.',
            ],
        },
        {
            id: 'fatal-blow', name: 'The Fatal Blow', nudge: false,
            val: 'pos',
            m: /fatal blow|final attempt|goal is won|allies pull out|emerges to win/i,
            tech: [{ s: 'Cl', l: 'Climax' }, { s: 'Og', l: 'Obligatory Scene' }],
            crit: [
                'the DECISIVE act — the one the whole story has promised, delivered on the page and not summarised',
                'your protagonist must be the one who does it',
            ],
            ex: '*The Lion King:* Simba does not push Scar; Scar’s own lie brings him down, and Simba lets it.',
            more: [
                '*Macbeth:* Macduff kills him in a single fight, off a promise made in Act 4.',
                '*Harry Potter:* Harry holds on to Quirrell rather than let go — his own skin is the weapon, and he is the one using it.',
                '*An Inspector Calls:* Sheila hands the ring back — the one decisive act anybody in that family actually takes.',
            ],
        },
        {
            id: 'tragic-acceptance', name: 'Accepting the Fate', nudge: false,
            val: 'neg',
            m: /accepts his\/her fate|reflects on past mistakes|expresses regret|forces of opposition and fate/i,
            tech: [{ s: 'Ct', l: 'Catharsis' }, { s: 'Hm', l: 'Hamartia' }],
            crit: [
                'in a tragedy your protagonist SEES the truth too late — and goes on anyway',
                'the recognition is the payoff; do not soften it into a rescue',
            ],
            ex: '*Macbeth:* "I have lived long enough" — he understands exactly what he traded, and still walks out to fight.',
            more: [
                '*Eric in An Inspector Calls:* he accepts what he did while his parents are still arguing about whether it happened.',
                '*Of Mice and Men:* George knows exactly what he is about to do, and talks about the rabbits while he does it.',
                '*Romeo and Juliet:* "Then I defy you, stars" — Romeo has read the situation completely wrongly and chooses the vault anyway.',
            ],
        },

        // ───────────────────── STAGE VI — AFTERMATH ─────────────────────
        {
            id: 'final-image', name: 'The Final Image', nudge: true,
            val: 'pos', pri: 1,
            m: /final image/i,
            tech: [{ s: 'Cy', l: 'Cyclical Structure' }, { s: 'Zi', l: 'Zoom-In / Zoom-Out Ending' }],
            crit: [
                'MIRROR your opening image — same place, object or action, changed',
                'let the contrast do the telling: do not explain what has changed, SHOW the difference',
                'this is the picture the reader keeps, so it should be one image, not a summary',
            ],
            ex: '*A Christmas Carol:* the same counting-house, the same clerk, the same coal — and now the fire is built up and the door is open.',
            more: [
                '*The Lion King:* Rafiki lifts a new cub on Pride Rock, exactly as Simba was lifted in scene one.',
                '*Great Expectations:* Pip and Estella in the ruined garden where they first met, both of them worn down into kindness.',
                '*Of Mice and Men:* the same green pool by the river the book opened on — and now only one man walking away from it.',
            ],
        },
        {
            id: 'how-much-learnt', name: 'How Much Have They Learnt?', nudge: false,
            val: 'pos',
            m: /how much has the protagonist learnt|grown or was it all just a dream|changed or was it all just a dream/i,
            tech: [{ s: 'Th', l: 'Theme' }, { s: 'Rn', l: 'Resolved Ending' }],
            crit: [
                'answer it with a CHOICE, not a statement — show them doing something the old self could not',
                'partial learning is allowed and often stronger; be honest about what did not change',
            ],
            ex: '*An Inspector Calls:* Sheila and Eric have learnt it; their parents have not — and the last phone call is aimed at exactly that gap.',
            more: [
                '*Great Expectations:* Pip has learnt what Joe was worth, and the learning cost him everything he thought he wanted.',
                '*A Christmas Carol:* Scrooge never announces that he has changed — he raises Bob’s wages, and then keeps doing it.',
                '*The Lion King:* Simba takes the throne he spent the whole film running from, which is the only answer the question has.',
            ],
        },
        {
            id: 'balance-restored', name: 'Balance Restored', nudge: false,
            val: 'pos',
            m: /community is liberated|balance is restored|establish a community|reconnecting with humanity|appears whole|role in the kingdom/i,
            tech: [{ s: 'De', l: 'Denouement' }, { s: 'Mc', l: 'Microcosm' }],
            crit: [
                'show the WORLD after, not just your protagonist — one detail of ordinary life resuming',
                'if you opened on the community suffering, close on the same community, differently',
            ],
            ex: '*The Lion King:* the rains return and the Pride Lands go green — the world answering the change in one person.',
            more: [
                '*Harry Potter:* the end-of-year feast in Gryffindor colours, and the school ordinary again for one evening.',
                '*A Christmas Carol:* Tiny Tim does not die, and there is enough on the Cratchits’ table.',
                '*Macbeth:* Malcolm calls the exiles home and makes his thanes earls — a country handed back its ordinary business.',
            ],
        },
        {
            id: 'return-with-elixir', name: 'Returning with the Elixir', nudge: true,
            val: 'pos', pri: 1,
            m: /returns with (the )?elixir|newfound wisdom|mastered himself|finds fulfillment/i,
            tech: [{ s: 'Mk', l: 'MacGuffin' }, { s: 'Sy', l: 'Symbolism' }],
            crit: [
                'they bring something BACK that the ordinary world needed — a truth, a person, a thing, a changed way of behaving',
                'make it visible: the elixir should be something a reader can point at',
            ],
            ex: '*A Christmas Carol:* Scrooge brings back Christmas itself — a turkey, a raised wage, and a nephew’s dinner accepted at last.',
            more: [
                '*Voyage and Return stories:* Dorothy brings home the knowledge that she wanted what she already had.',
                '*Harry Potter:* Harry goes back to the Dursleys carrying the one thing he did not have in chapter one — somewhere else to belong.',
                '*Great Expectations:* what Pip brings back is the ability to see Joe clearly, which is the only fortune he ends the book with.',
            ],
        },
        {
            id: 'tragic-death', name: 'The Death, and the Response', nudge: true,
            val: 'neg',
            m: /is killed by forces|final act of violence|rejoice in or mourn|if they mourn|if they don’t learn|if they don't learn|same problem likely/i,
            tech: [{ s: 'Ct', l: 'Catharsis' }, { s: 'Th', l: 'Theme' }],
            crit: [
                'in a tragedy the end is a LOSS — and the meaning lives in how the survivors respond to it',
                'decide deliberately: do they learn, or does the problem stay loaded for the next person?',
            ],
            ex: '*Romeo and Juliet:* the families make peace over two bodies, and the play is careful to note the price of the lesson.',
            more: [
                '*Of Mice and Men:* nobody understands what George did, and Candy’s question hangs over the last page.',
                '*An Inspector Calls:* the phone rings again — the family has learnt nothing, and it is all about to happen for real.',
                '*Macbeth:* his head is carried on stage and Scotland gets a new king — the response is relief, not grief, which is its own verdict.',
            ],
        },
    ];

    // ── VALENCE (Neil, 2026-08-01) ────────────────────────────────────────────────────────────
    // Every beat carries a direction: does this moment take the story DOWN, UP, or neither? Neil's
    // own coloured plot documents did this on paper, and the reason is the teaching: tension is not
    // a run of bad events, it is the OSCILLATION between them. A student who can see
    // `- - - - o - +` down the margin can see the shape they are meant to be building.
    //
    // ⭐ SET ON THE CONCEPT, NEVER THE ROW. The 8 templates hold 801 beat rows and they resolve to
    // these 70 concepts, so this is 70 judgements rather than 800 (WML CLAUDE.md §4c.9,
    // "map to concepts, never author per row").
    //
    // `valBy` overrides per archetype. Tragedy is the only real consumer: it starts at the height
    // and ends in ruin, where the other seven are hero's-journey variants that start down and end
    // up. Neil: "tragedy starts in a positive state with a question mark, but ends negative...
    // whereas all the others are the opposite."
    const VALENCES = { pos: 'positive', neg: 'negative', neu: 'neutral' };

    // ⚠️ PRIORITY, and why it exists. `conceptFor()` takes the FIRST regex match over this array,
    // and the order was never checked for specificity — so six concepts were UNREACHABLE: 63 rows
    // across the 8 templates resolved to a more general concept that appears earlier, and served
    // its criteria, its worked example and its technique chips instead. The worst was 24 rows of
    // "Hero surpasses the Mentor" being told a mentor is "someone who has BEEN where your
    // protagonist is going" — the opposite of what that beat asks for. `pri: 1` lifts a specific
    // concept above the general one that was eating it. Enforced by bin/cw6-outline-harness.js,
    // which now FAILS if any concept wins zero rows.
    function conceptFor(label, prompt) {
        const hay = (label || '') + ' — ' + (prompt || '');
        let best = null;
        for (let k = 0; k < CONCEPTS.length; k++) {
            const c = CONCEPTS[k];
            if (!c.m.test(hay)) continue;
            if (!best || (c.pri || 0) > (best.pri || 0)) best = c;
        }
        return best;
    }
    // The whole point of deriving this at RENDER time rather than baking it into the saved
    // document: the outline scaffold is baked, so a stamped attribute would style only NEW
    // documents and leave every existing one needing a migration
    // (reference_wml_outline_scaffold_baked_needs_onload_heal). Resolved from the criterion the
    // NodeView already holds, every valence edit reaches every existing document on next load,
    // and nothing is written to a ProseMirror node at all.
    function valenceFor(label, prompt, archetypeKey) {
        const c = conceptFor(label, prompt);
        if (!c || !c.val) return '';
        const over = c.valBy && archetypeKey && c.valBy[archetypeKey];
        return over || c.val;
    }

    window.WML_CW6_CONCEPTS = { STAGES: STAGES, CONCEPTS: CONCEPTS, VALENCES: VALENCES,
        conceptFor: conceptFor, valenceFor: valenceFor };
})();
