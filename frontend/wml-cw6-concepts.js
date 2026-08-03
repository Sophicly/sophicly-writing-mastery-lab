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
            ex: '*Great Expectations:* in London Pip is neither the forge boy nor a gentleman — he is ashamed of Joe’s visit, and ashamed of being ashamed.',
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
            why: 'so the first picture already carries the story\'s struggle and its mood',
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
            ex: '*A Christmas Carol:* Scrooge in his freezing counting-house, keeping the coal-box in his own room so his clerk cannot build up the fire — greed and cold in one picture.',
            more: [
                '*Of Mice and Men:* two men walking a dusty road with everything they own on their backs — hope and homelessness together.',
                '*Lord of the Flies:* a scar torn through the jungle by the crashed plane — paradise already damaged.',
                '*The Hunger Games:* Katniss wakes on reaping morning to the cold hollow where her sister should be — the day the district gives up a child.',
            ],
        },
        {
            id: 'final-image-setup', name: 'The Opening Image, Expanded', nudge: true,
            why: 'so we see their whole world, and the hole in the middle',
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
            why: 'so the reader knows the life this story is about to break',
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
            why: 'so the reader feels the crack before anything actually breaks',
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
            why: 'so the reader knows what is lost if nothing changes',
            val: 'neg',
            m: /figurative death|stays the same|life is oppressive|sees life as oppressive/i,
            tech: [{ s: 'Sk', l: 'Stakes' }],
            crit: [
                'name what your protagonist LOSES if nothing changes — not death, but the death of something in them',
                'make it concrete: a person, a chance, a version of themselves that runs out of time',
            ],
            ex: '*A Christmas Carol:* if Scrooge does not change he stays the man Belle walked away from — she left because "another idol has displaced me", and the boy who could love went with her.',
            more: [
                '*Great Expectations:* if Pip keeps believing "common" means worthless, he loses Joe — which is exactly what happens when he grows ashamed of the man who raised him.',
                '*An Inspector Calls:* if Sheila stays the girl who had a shop assistant sacked for smiling, she becomes her mother.',
                // v7.20.379 (#134): was Simba in the jungle — a Stage III/IV state on a Stage I beat.
                '*The Hunger Games:* if Katniss keeps her head down and trades quietly, Prim’s name goes back in the bowl every year for the rest of her childhood.',
            ],
        },
        {
            id: 'problem-snapshot', name: 'A Snapshot of the Problem', nudge: false,
            why: 'so we watch the problem happen instead of being told about it',
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
            critBy: { 'rebirth-redemption': [
                '⭐ in a REBIRTH story the flaw may belong to ANOTHER central character whom your protagonist must change',
                'if you choose that, decide early WHOSE arc the story is: the one who changes is the protagonist',
                'the flaw must still cost somebody something on the page, whoever owns it',
            ] },
            why: 'so the story has something to fix, and the ending can prove it',
            val: 'neg',
            m: /flaw/i,
            tech: [{ s: 'Fw', l: 'The Flaw' }, { s: 'Hm', l: 'Hamartia' }],
            crit: [
                'the flaw is a SHIELD — it once protected them, and now it holds them back',
                'show it as behaviour, not a label: "cannot ask for help", not "insecure"',
            ],
            ex: '*Macbeth:* he cannot stand to be seen hesitating — one taunt about being a coward and he stops arguing and acts, because being the fearless soldier is the only self he trusts.',
            more: [
                '*A Christmas Carol:* Scrooge’s flaw is that he decided long ago people cost more than they give.',
                '*Jekyll and Hyde:* Jekyll’s flaw is that he wants his appetites without his reputation paying for them.',
                '*Great Expectations:* Pip’s flaw is that he has learned to be ashamed of Joe — the kindest person in his life.',
            ],
        },
        {
            id: 'theme-stated', name: 'Theme Stated', nudge: true,
            why: 'so the ending feels true — the reader was told it at the start',
            whyBy: { tragedy: 'so we hear the truth he never learns, and the loss stings' },
            val: 'neu',
            m: /theme stated/i,
            tech: [{ s: 'Tz', l: 'Theme Stated' }, { s: 'Th', l: 'Theme' }],
            crit: [
                'someone SAYS the story’s truth out loud, early — and your protagonist does not yet understand it',
                'it is a line of dialogue, not a moral: short, ordinary, easy to walk past',
                'they will only understand it by the end, which is what makes the ending land',
            ],
            ex: '*An Inspector Calls:* Sheila, in Act 1 — "But these girls aren’t cheap labour — they’re people" — the play’s truth, said early and brushed aside by the table.',
            more: [
                '*A Christmas Carol:* Fred insists Christmas "has done me good, and will do me good" — the truth Scrooge dismisses in Stave One.',
                '*Animal Farm:* "All animals are equal" is stated at the start, and the whole book is what happens to it.',
                '*Of Mice and Men:* "Guys like us... are the loneliest guys in the world" — George says it in chapter one, and the rest of the book tests it.',
            ],
        },
        {
            id: 'false-identity', name: 'False Identity', nudge: true,
            why: 'so we can watch the mask crack and the real self appear',
            val: 'neg',
            m: /false identity|anonymous|believes not worthy/i,
            tech: [{ s: 'Dj', l: 'Duality' }, { s: 'Sy', l: 'Symbolism' }],
            crit: [
                'the MASK: who your protagonist pretends to be, or has been told they are',
                'show it in something external — a name, a uniform, a job, a room they keep a certain way',
            ],
            ex: '*Great Expectations:* Pip accepts the label "common labouring boy" and is ashamed of his own hands — the mask is put on him before he chooses it.',
            more: [
                '*Jekyll and Hyde:* Jekyll’s respectable public face is the mask — and the locked laboratory door is where he goes to take it off.',
                // v7.20.379 (#134): was Simba in the jungle — Stage III, not the Setup.
                '*Harry Potter:* Harry is "the boy in the cupboard", a label the Dursleys handed him so early he has never thought to question it.',
                '*An Inspector Calls:* Sheila plays the pleased, pretty daughter of the engagement dinner — a mask she drops the moment she hears what she did to Eva Smith.',
            ],
        },
        {
            id: 'foreshadow', name: 'Foreshadowing', nudge: true,
            why: 'so the later rescue is a payoff you planted, not lucky timing',
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
                '*A Christmas Carol:* Scrooge never painted out his dead partner’s name, so "Scrooge and Marley" still stands over the warehouse door — an ordinary detail until Marley walks in.',
            ],
        },
        {
            id: 'limited-awareness', name: 'Limited Awareness', nudge: false,
            why: 'so the reader can watch them learn what they do not know',
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
            why: 'so the change the story wants is bigger than one person',
            val: 'neg',
            m: /oppressive|casts shadow over|mistreat|dark figures|community suffers|shadow over the community/i,
            tech: [{ s: 'Sd', l: 'The Shadow' }, { s: 'Mc', l: 'Microcosm' }],
            crit: [
                'the pressure is not only on your protagonist — show it lying over EVERYONE around them',
                'one small detail standing for the whole: what people stopped doing, or learned not to say',
            ],
            ex: '*Animal Farm:* rations are cut again and Squealer reads out lists of figures proving the animals are better fed than in Jones’s day — and nobody contradicts him.',
            more: [
                '*The Hunger Games:* the whole of District 12 stands silent at the reaping, because grief has a schedule there.',
                '*Romeo and Juliet:* the Prince tells Verona a third brawl will cost lives — a whole city living under a grudge none of them chose.',
                '*Jane Eyre:* at Lowood the girls’ hair is cut off and their porridge arrives burnt, and nobody complains, because complaining has a price.',
            ],
        },
        {
            id: 'monster-distant', name: 'The Threat at a Distance', nudge: false,
            why: 'so the monster feels huge before we ever see it',
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
                '*Jane Eyre:* the strange laugh on the third floor, the fire in Rochester’s bed, the torn veil — the thing in the attic is heard for hundreds of pages before it is seen.',
                '*Jekyll and Hyde:* Enfield’s story of a man calmly trampling a child is all we are given of Hyde until Utterson finally waits for him in the dark.',
            ],
        },
        {
            id: 'gratification', name: 'Harmful Gratification', nudge: false,
            why: 'so we see the appetite that will destroy him before it does',
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
            why: 'so the reader knows exactly what winning would look like',
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
                '*The Lion King:* the sunlit land Mufasa shows him from Pride Rock — "everything the light touches" — the exact thing Simba wants to own.',
                '*A Christmas Carol:* the coins in the strongbox — the one thing Scrooge can count that has never disappointed him.',
            ],
        },
        {
            id: 'warning-ignored', name: 'The Warning Ignored', nudge: false,
            why: 'so ignoring the advice later reads as his own choice',
            whyBy: { tragedy: 'so the reader watches him step past the warning that could have saved him' },
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
            why: 'so they leave the small world where they could never rise',
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
                '*An Inspector Calls:* the doorbell cuts Birling off mid-speech — an unasked-for ring at the door, and the evening the family planned is over.',
                '*The Hunger Games:* Prim’s name is read out at the reaping — one name, and the old life is finished.',
            ],
        },
        {
            id: 'sees-way-to-fix', name: 'A Way to Fix It', nudge: false,
            why: 'so the story has a plan simple enough to go wrong later',
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
            why: 'so we know their ordinary life before the story wrecks it',
            val: 'neu',
            m: /goal here is general|something normal/i,
            tech: [{ s: 'Pr', l: 'Protagonist' }],
            crit: [
                'what they were trying to do BEFORE the story — small, ordinary, unglamorous',
                'get through a shift, pass a test, avoid a person, keep something quiet',
            ],
            ex: '*An Inspector Calls:* Sheila’s goal is to enjoy her engagement dinner and be admired in her new ring — nothing beyond the evening.',
            more: [
                '*Of Mice and Men:* George’s goal is to get through the bucking season with the pay in his pocket and Lennie out of trouble.',
                '*Harry Potter:* Harry’s goal is to get through the summer without the Dursleys noticing he exists.',
                '*Jane Eyre:* Jane’s goal at Thornfield is to teach one child well and keep the post.',
            ],
        },
        {
            id: 'world-deteriorates', name: 'The World Deteriorates', nudge: false,
            why: 'so pressure builds until doing nothing stops being possible',
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
                '*Jane Eyre:* typhus sweeps Lowood and Jane watches the school empty bed by bed, Helen Burns among the dead.',
                '*The Hunger Games:* the arena itself tightens: the Gamemakers set the woods alight to drive the tributes together.',
            ],
        },

        // ───────────────────────── STAGE II — DREAM ─────────────────────────
        {
            id: 'balance-deteriorates', name: 'The Balance Tips', nudge: false,
            why: 'so the reader feels the settled life can no longer hold',
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
            why: 'so the story\'s truth gets said out loud by people, not the author',
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
            why: 'so we see the flaw actively holding them back, not bad luck',
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
                '*Macbeth:* Macbeth tells his wife "we will proceed no further in this business" — and she has him back inside forty lines.',
            ],
        },
        {
            id: 'mentor', name: 'The Mentor', nudge: false,
            why: 'so someone who has been there makes the change feel possible',
            val: 'pos',
            m: /mentor/i,
            tech: [{ s: 'Mr', l: 'The Mentor' }, { s: 'Aa', l: 'Ally' }],
            crit: [
                'someone who has BEEN where your protagonist is going, and gives guidance rather than rescue',
                'they should be specific and flawed — a mentor who is simply wise is furniture',
            ],
            ex: '*A Christmas Carol:* Marley, who lived Scrooge’s life exactly and now drags the chain he made yard by yard — a mentor who is the warning.',
            more: [
                '*The Lion King:* Rafiki, who hits Simba with a stick before he explains anything.',
                '*Great Expectations:* Joe, whose mentoring is only ever by example, and Pip takes years to notice it.',
                '*The Hunger Games:* Haymitch, who is drunk before he is any use, and whose advice is mostly about being liked.',
            ],
        },
        {
            id: 'prophecy', name: 'The Prophecy', nudge: true,
            why: 'so he acts on a promise he only half understands',
            whyBy: { tragedy: 'so the promise he trusts is the thing that destroys him' },
            val: 'neg',
            m: /prophecy/i,
            tech: [{ s: 'Fo', l: 'Foreshadowing' }, { s: 'Wh', l: 'Withholding Information' }],
            crit: [
                'a promise about the future your protagonist BELIEVES — and it must be incomplete or double-edged',
                'the strongest prophecies come true in a way the character never meant',
            ],
            ex: '*Macbeth:* "none of woman born" shall harm him — true, and useless, because he hears it as safety.',
            more: [
                '*Romeo and Juliet:* before the Capulet feast Romeo says his mind misgives "some consequence yet hanging in the stars" — and goes in anyway.',
                '*Frankenstein:* the creature promises "I will be with you on your wedding-night", and Victor assumes it means his own death.',
                '*Harry Potter:* the prophecy says neither can live while the other survives — and Voldemort makes it true by acting on it.',
            ],
        },
        {
            id: 'the-sword', name: 'The Gift (the "Sword")', nudge: true,
            why: 'so the new identity has an object the reader can see',
            whyBy: { tragedy: 'so the new role never quite fits the man wearing it' },
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
                '*Lord of the Flies:* Piggy finds the conch and shows Ralph how to blow it — the object that turns a boy on a beach into a chief.',
            ],
        },
        {
            id: 'facade-goal', name: 'The Façade Goal', nudge: false,
            why: 'so the real need can surface later and surprise them',
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
            why: 'so the flaw has a cause, and changing later feels possible',
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
                '*Frankenstein:* Victor’s mother dies of scarlet fever just before he leaves for Ingolstadt — the death the whole obsession with reanimating the dead is built to undo.',
                '*Jane Eyre:* the red room at Gateshead, where Jane is locked in as a child and left with her fear until she faints.',
            ],
        },
        {
            id: 'herald', name: 'The Herald', nudge: false,
            why: 'so the news that changes everything arrives from outside, not from their head',
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
            why: 'so the change starts small and the reader believes the later transformation',
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
                '*An Inspector Calls:* Sheila works out that the girl in the photograph is the girl she had sacked, and never goes back to who she was.',
                '*The Lion King:* Rafiki shows Simba his reflection, and he sees Mufasa in it.',
                '*Of Mice and Men:* George hears Candy say he should have shot his own dog himself, and understands what he will one day have to do for Lennie.',
            ],
        },
        {
            id: 'threshold', name: 'Crossing the Threshold', nudge: true,
            why: 'so the commitment is a physical act the reader can see',
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
            why: 'so the reader roots for them and believes they could succeed later',
            val: 'pos',
            m: /glimpse of (his\/her )?true self|glimpse of true self|warmer humanity|potential to change/i,
            tech: [{ s: 'Hn', l: 'Moment of Humanity' }, { s: 'Dj', l: 'Duality' }],
            crit: [
                'one moment where the mask slips and we see who they could be',
                'small kindness, unexpected skill, an honest sentence — then let the mask return',
            ],
            ex: '*A Christmas Carol:* Scrooge laughs at Fezziwig’s party — the first time we see he was once capable of joy.',
            more: [
                '*Of Mice and Men:* George, alone with Slim, admits he used to torment Lennie for laughs until it stopped being funny — one honest sentence, then the joking closes over again.',
                '*Macbeth:* "I dare do all that may become a man; who dares do more is none" — for one line he knows exactly where the limit is.',
                '*Great Expectations:* Pip secretly pays to set Herbert up in business and makes sure Herbert never learns who did it — the one thing he hides because it is generous.',
            ],
        },
        {
            id: 'stunning-surprise', name: 'The Stunning Surprise', nudge: false,
            why: 'so his old plan dies and he is forced to change course',
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
            why: 'so the team we will follow is introduced as the new world opens',
            whyBy: { tragedy: 'so the crowd that flatters him into the special world seals his fall' },
            val: 'pos',
            m: /allies|companions|ally appears|small group/i,
            tech: [{ s: 'Aa', l: 'Ally' }, { s: 'Fl', l: 'Foil' }],
            crit: [
                'who joins them — and each ally should be GOOD at something your protagonist is not',
                'two or three, sharply different from each other, is stronger than a crowd',
            ],
            ex: '*Harry Potter:* Ron gives him a family and Hermione gives him a brain — neither is a copy of Harry.',
            more: [
                '*Stranger Things:* Dustin’s science, Eleven’s power and Hopper’s police badge — three tools, none of which Mike has.',
                '*The Lion King:* Timon and Pumbaa, who are experts at the one thing Simba cannot do — forgetting — and who keep him fed and alive for years.',
                '*The Hunger Games:* Rue, who can read the arena’s trees, and Cinna, who can read its audience — neither skill is Katniss’s.',
            ],
        },
        {
            id: 'physical-attack', name: 'The First Attack', nudge: false,
            why: 'so the reader learns the danger is real and the goal is not free',
            val: 'neg',
            m: /physical attack|receives a warning|suffers a|attacked again|resistance does not work/i,
            tech: [{ s: 'Cf', l: 'Conflict' }, { s: 'Sk', l: 'Stakes' }],
            crit: [
                'the opposition touches them for the first time — and your protagonist LOSES',
                'losing here is the point: it proves the goal is not free',
            ],
            ex: '*The Hunger Games:* at the Cornucopia a knife thrown by Clove buries itself in the pack on Katniss’s back, and she runs with almost nothing — the bloodbath proves she cannot win in the open.',
            more: [
                '*Frankenstein:* the creature kills William, and Victor understands what he has released.',
                '*Lord of the Flies:* the hunters let the signal fire go out and a ship passes the island — the first real loss, and Ralph can do nothing about it.',
                '*Great Expectations:* Estella is told to play cards with Pip, calls him coarse and common, and he goes outside to cry about his own hands.',
            ],
        },
        {
            id: 'dark-force-rising', name: 'The Dark Force Rising', nudge: false,
            why: 'so the threat feels real and growing before he ever faces it',
            val: 'neg',
            m: /dark force|rise to power|consequences if they do not change|reminds protagonist of need/i,
            tech: [{ s: 'Sd', l: 'The Shadow' }, { s: 'Ra', l: 'Rising Action' }],
            crit: [
                'the opposition GROWS while your protagonist hesitates — show its reach widening',
                'one concrete gain: a place taken, a person turned, a rule changed',
            ],
            ex: '*Animal Farm:* Napoleon acquires the dogs, and after that the votes stop mattering.',
            more: [
                '*Macbeth:* Malcolm and Siward raise ten thousand men in England and the thanes slip away to join them, while Macbeth shuts himself inside Dunsinane.',
                '*The Lion King:* the hyenas move into the Pride Lands and the herds leave — Scar’s reach measured in empty grass.',
                '*Stranger Things:* the lab widens its reach — phones tapped, a body faked, the town’s own police told to stop looking.',
            ],
        },

        // ───────────────────── STAGE III — FASCINATION ─────────────────────
        {
            id: 'special-world', name: 'The Special World', nudge: false,
            why: 'so the reader feels the wonder before the world turns on them',
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
                '*The Wizard of Oz:* Oz in colour after Kansas in grey — beautiful, and not on her side.',
                '*The Hunger Games:* the Capitol — food arriving up a lift, people with dyed skin, and everyone delighted to meet a girl they intend to watch die.',
            ],
        },
        {
            id: 'betrayal', name: 'The Betrayal', nudge: false,
            why: 'so the danger becomes personal and the protagonist can trust only themselves',
            val: 'neg',
            m: /betray/i,
            tech: [{ s: 'Sw', l: 'Shapeshifter' }, { s: 'Pt', l: 'Plot Twist' }],
            crit: [
                'someone TRUSTED turns — and their reason should make sense from where they stand',
                'the betrayal must cost your protagonist something specific',
            ],
            ex: '*Animal Farm:* Napoleon sends Boxer — the animal who worked hardest and trusted most — to the knacker’s, and buys whisky with the money.',
            more: [
                '*Macbeth:* the witches’ promises of safety turn out to be equivocation — the voice he trusted most is the one that walks him into Birnam Wood.',
                '*The Lion King:* Scar holds his brother at the edge of the gorge, says "long live the king", and lets go.',
                '*Great Expectations:* Miss Havisham lets Pip believe for years that she is his benefactor, because his hope is useful to her.',
            ],
        },
        {
            id: 'underworld', name: 'Into the Underworld', nudge: true,
            why: 'so he faces the fear in a place that looks like it',
            val: 'neg',
            m: /underworld|inmost cave|deepest fears|inner demons/i,
            tech: [{ s: 'Ml', l: 'Mental Landscape' }, { s: 'Sy', l: 'Symbolism' }],
            crit: [
                'a DARK PLACE they go down into — a cellar, a tunnel, a night, a hospital, a forest',
                'the place should look like the fear: let the setting do the psychology',
            ],
            ex: '*Harry Potter:* the trapdoor under Fluffy’s paws on the third floor, and everything beneath the school it leads down into.',
            more: [
                '*Jekyll and Hyde:* Soho at night, and the locked dissecting-room where Jekyll keeps the other half of himself.',
                '*Great Expectations:* the sluice-house on the marshes, in the dark, alone with Orlick.',
                '*Frankenstein:* the charnel-houses and dissecting rooms where Victor collects his materials by candlelight.',
            ],
        },
        {
            id: 'elixir', name: 'The Elixir', nudge: true,
            why: 'so the later rescue was planted early and never feels like cheating',
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
            why: 'so the reader believes it might work before it stops working',
            val: 'pos',
            m: /all seems to be going well|all may seem to go well|immune from danger|getting away with it|seems to be winning|threat recedes|comfortable and immune/i,
            tech: [{ s: 'Ux', l: 'Subverted Expectation' }, { s: 'Di', l: 'Dramatic Irony' }],
            crit: [
                'a stretch where it WORKS — real success, not a fake one',
                'let the reader relax; put one small wrong detail in the corner of the picture',
            ],
            ex: '*Animal Farm:* the first harvest is the biggest the farm has ever had and the animals work singing — while the milk and the windfall apples quietly go to the pigs alone.',
            more: [
                '*Macbeth:* he is crowned, the banquet is laid, and Banquo’s murderer is at the door.',
                '*The Hunger Games:* Katniss and Rue destroy the Careers’ supplies, and for one night the alliance is actually working.',
                '*Great Expectations:* Pip in London with money, rooms and a servant — everything he asked for, and Joe standing awkwardly in the doorway.',
            ],
        },
        {
            id: 'storm-coming', name: 'A Storm is Coming', nudge: true,
            why: 'so the reader senses trouble before anything has actually happened',
            val: 'neg',
            m: /a storm is coming|onset of evil|something threatening|shadow begins to intrude/i,
            tech: [{ s: 'Pf', l: 'Pathetic Fallacy' }, { s: 'Md', l: 'Mood' }],
            crit: [
                'ATMOSPHERE, not event — weather, light, sound, an animal behaving oddly',
                'nothing has happened yet; the reader should simply not want to turn the page',
            ],
            ex: '*Macbeth:* Banquo outside Duncan’s chamber before the murder — the candles of heaven are all out, he cannot sleep, and he will not say why.',
            more: [
                '*Jane Eyre:* the chestnut tree is split by lightning the night Rochester proposes.',
                '*Lord of the Flies:* the heat presses down and thunder builds for pages before Simon dies.',
                '*Frankenstein:* lightning over the mountains outside Geneva, and a shape moving between the flashes.',
            ],
        },
        {
            id: 'mood-turns', name: 'The Mood Turns', nudge: false,
            why: 'so the reader can measure how far things have fallen since the start',
            val: 'neg',
            m: /mood changes|things (begin to |continue to )?go wrong|going downhill|frustrat|begins to feel/i,
            tech: [{ s: 'Md', l: 'Mood' }, { s: 'Ta', l: 'Tone' }],
            crit: [
                'the FEEL of the story shifts from excitement to grind — show it in what a day is like now',
                'compare against an earlier scene so the reader can measure the drop',
            ],
            ex: '*Lord of the Flies:* meetings that were exciting become arguments nobody attends, and the beach stops being a holiday.',
            more: [
                '*Of Mice and Men:* after Curley’s wife is found in the barn, Candy asks about the farm and George answers "I think I knowed we’d never do her" — same dream, said flat.',
                '*Animal Farm:* "Beasts of England" is banned, the rations shrink again, and the animals work longer for less.',
                '*An Inspector Calls:* the celebration never restarts — same room, same people, and nobody sits back down.',
            ],
        },
        {
            id: 'obstacles', name: 'Rising Obstacles', nudge: false,
            why: 'so the prize feels earned rather than handed over',
            whyBy: { tragedy: 'so every temptation taken makes the next crime easier' },
            val: 'neg',
            m: /obstacles|crises|temptations|monsters|tests/i,
            tech: [{ s: 'Ra', l: 'Rising Action' }, { s: 'Cf', l: 'Conflict' }],
            crit: [
                'each obstacle HARDER than the last — escalation is the whole job of this stage',
                'give one concrete example rather than a list; a named difficulty beats "many problems"',
            ],
            ex: '*Harry Potter:* Fluffy, then the Devil’s Snare, then the keys, then the chess board — each one costs more than the last.',
            more: [
                '*The Hunger Games:* the wall of fire, then the tracker jacker nest, then the mutts at the Cornucopia — the arena keeps raising the price.',
                '*Macbeth:* Banquo, then Fleance escaping, then Macduff gone to England — every answer he finds makes a bigger problem.',
                '*Great Expectations:* hiding Magwitch, then moving him, then the river and the customs boat — each step costs more than the last.',
            ],
        },
        {
            id: 'villain-advances', name: 'The Opposition Advances', nudge: false,
            why: 'so the danger keeps growing while the protagonist is still not ready',
            val: 'neg',
            m: /advances like a bulldozer|villain advances|monster advances|opposition advances|demonstrates his power|demonstrate their power|demonstrates its power/i,
            tech: [{ s: 'Ax', l: 'Antagonist' }, { s: 'Nm', l: 'Nemesis' }],
            crit: [
                'show the antagonist WINNING something — not threatening, actually taking',
                'their competence is what makes your protagonist’s victory worth anything',
            ],
            ex: '*Macbeth:* Macduff and Malcolm raise an English army and the thanes desert — the opposition stops threatening and starts taking Scotland back.',
            more: [
                '*Frankenstein:* the creature kills Clerval, and Victor understands that everyone he loves is a target.',
                '*Lord of the Flies:* Jack takes the fire, then the hunters, then raids the shelters for Piggy’s glasses — and everything he takes, he keeps.',
                '*Stranger Things:* the lab passes off a fake body as Will’s, and the whole town buries a boy who is still alive.',
            ],
        },
        {
            id: 'guidance', name: 'Rest and Guidance', nudge: false,
            why: 'so the reader can breathe and a conversation can change him',
            whyBy: { tragedy: 'so the advice he will later defy is on the page first' },
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
            why: 'so the reader dreads the place before he goes into it',
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
            why: 'so the reader believes how hard letting go really is',
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
            why: 'so the redemption has a deadline the reader can feel slipping away',
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
            critBy: { 'tragedy': [
                '⚠ in a TRAGEDY nothing is earned out of this — do not write a bottom he climbs back from',
                'the despair is the destination, not the turning point; what follows is consequence, not recovery',
                'let him still believe he can win. That gap between his belief and the reader\u2019s knowledge is the tragedy',
            ] },
            why: 'so the mask going back on shows how much the change costs',
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
                '*Great Expectations:* Magwitch is taken, the fortune dies with him, and Estella is married — everything Pip built himself out of turns out to belong to someone else.',
                '*A Christmas Carol:* Scrooge kneels at his own neglected headstone and grips the Spirit’s hand — everything he built has bought him an unvisited grave.',
            ],
        },
        {
            id: 'nightmare-battle', name: 'The Nightmare Battle', nudge: true,
            why: 'so beating the enemy and beating his old self are one act',
            whyBy: { tragedy: 'so we watch the old self win, and the fall is complete' },
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
            critBy: { 'tragedy': [
                'this is not ONE split — write SEVERAL, each worse than the last, so the isolation is a slide not an event',
                'each break should be caused by something HE does, not by a misunderstanding',
                'save the person closest to him for last',
            ] },
            why: 'so the protagonist is stripped of support right before the hardest part',
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
            why: 'so the danger is real and the reader can see no escape',
            whyBy: { 'heros-journey': 'so the reader believes the hero could actually lose here', 'coming-of-age': 'so growing up is shown to carry a real, frightening cost', 'rags-to-riches': 'so everything they have gained can visibly be taken back', 'rebirth-redemption': 'so he must face the life he built, with nowhere left to hide', 'the-quest': 'so the goal looks unreachable right before they reach it', tragedy: 'so the fall ahead feels inevitable, not sudden — here he does not escape', 'voyage-and-return': 'so getting home stops looking certain, and the strange world turns hostile' },
            val: 'neg',
            m: /cornered the protagonist|only one outcome|serious threat to hero|threat to hero's survival|shadow's clutches|monster's clutches|may fall into/i,
            tech: [{ s: 'Sk', l: 'Stakes' }, { s: 'Sz', l: 'Suspense' }],
            crit: [
                'close every exit — the reader should not be able to see a way out either',
                'name the cost of losing, in one specific thing they will not get back',
            ],
            ex: '*The Hunger Games:* Katniss up the tree, calf burned, with the Careers camped underneath and nowhere to go but down.',
            more: [
                '*Macbeth:* Dunsinane surrounded, the wood moving, and every prophecy turning out to be a trap.',
                '*Jekyll and Hyde:* the original salt runs out, and there is no more of it to be had anywhere in London.',
                '*Great Expectations:* the boat is stopped on the river, Compeyson is aboard, and there is nowhere left to take Magwitch.',
            ],
        },
        {
            id: 'shadow-dominates', name: 'The Shadow Dominates', nudge: false,
            why: 'so the opposition is strong enough to make the victory worth reading',
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
            why: 'so the danger keeps rising instead of repeating, and the reader stays hooked',
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
            why: 'so the rescue pays off someone the reader already knows',
            whyBy: { tragedy: 'so the brief hope makes the coming destruction hurt more' },
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
            why: 'so going on is a deliberate choice, not just stubbornness',
            val: 'pos',
            m: /new information|second catalyst|choice to continue/i,
            tech: [{ s: 'Nw', l: 'Fresh News' }, { s: 'Tu', l: 'Turning Point' }],
            crit: [
                'one FACT arrives that makes going on possible — and it forces a choice, not a feeling',
                'the choice should cost something: they continue knowing what it will take',
            ],
            ex: '*Jane Eyre:* the innkeeper’s news that Bertha is dead and Thornfield burned is the one fact that makes returning possible — and Jane goes, knowing what she is taking on.',
            more: [
                '*Frankenstein:* Walton’s crew tells Victor the ice is breaking — the one fact that makes the pursuit possible again, and he chooses to go on north.',
                '*The Lion King:* Simba hears Scar admit he killed Mufasa — the guilt he had carried for years was never his to carry.',
                '*Great Expectations:* Pip learns whose daughter Estella really is, and chooses to give the fact to a dying man rather than keep it.',
            ],
        },
        {
            id: 'seizes-sword', name: 'Seizing the Sword', nudge: true,
            critBy: { 'tragedy': [
                '⚠ in a TRAGEDY this same moment is commitment to RUIN, not liberation — he accepts a self that will destroy him',
                'he must choose it knowingly. A man tricked into it is not tragic, he is unlucky',
                'show what he gives up to take it, and make it something the reader liked about him',
            ] },
            why: 'so the change shows in what he does, not what he feels',
            whyBy: { 'heros-journey': 'so he takes the new self knowing exactly what it will cost', 'coming-of-age': 'so he takes the new self knowing exactly what it will cost', 'overcoming-the-monster': 'so he takes the new self knowing exactly what it will cost', 'rags-to-riches': 'so he takes the new self knowing exactly what it will cost', 'rebirth-redemption': 'so he takes the new self knowing exactly what it will cost', 'the-quest': 'so he takes the new self knowing exactly what it will cost', tragedy: 'so his ruin is something he chooses with both eyes open', 'voyage-and-return': 'so he takes the new self knowing exactly what it will cost' },
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
            critBy: { 'tragedy': [
                '⚠ TRAGEDY inverts this: surpassing a DARK mentor means outdoing your corrupter in ruthlessness, not in virtue',
                'the mentor should look shocked, or afraid of what they made',
                'nothing is inherited here — he does not gain their wisdom, only their appetite, larger',
            ] },
            why: 'so the hero carries a debt into the final fight',
            val: 'neu', pri: 1,
            m: /surpasses the mentor|surpasses the dark mentor|mentor sacrifices|mentor fights|mentor dies/i,
            tech: [{ s: 'Mr', l: 'The Mentor' }, { s: 'Ck', l: 'Setup & Payoff' }],
            crit: [
                'the mentor must be OUT of the way for the final test — dead, defeated, absent or simply wrong',
                'your protagonist then does the thing the mentor could not',
            ],
            ex: '*Harry Potter:* Dumbledore is lured to London by a forged summons, so Harry faces the last room without him.',
            more: [
                '*The Lion King:* Mufasa is long dead, so it is Simba alone who climbs the rock and takes the throne his father cannot hand him.',
                '*A Christmas Carol:* the third spirit never speaks a word — Scrooge has to do the reading himself.',
                '*Jane Eyre:* Helen Burns dies at Lowood, and it is Jane who has to carry Helen’s endurance out into a world Helen never lived to face.',
            ],
        },
        {
            id: 'self-sacrifice', name: 'Willing to Sacrifice', nudge: true,
            why: 'so the change is proved by what they are willing to lose',
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
            why: 'so the win comes from something the hero noticed earlier',
            val: 'pos',
            m: /understands the .*weakness|weakness/i,
            tech: [{ s: 'Ax', l: 'Antagonist' }, { s: 'Nm', l: 'Nemesis' }],
            crit: [
                'your protagonist WORKS OUT the flaw in the opposition — from something they saw earlier',
                'the weakness should be the antagonist’s strength taken too far',
            ],
            ex: '*The Lion King:* Simba works out that Scar’s hold rests entirely on the lie about Mufasa’s death — so he forces Scar to say it out loud in front of the pride.',
            more: [
                '*Frankenstein:* Victor realises the creature’s one need is a companion — its only hold over him — and tears the half-made bride apart in front of it.',
                '*The Hunger Games:* the Capitol’s weakness is that it needs an audience, so Katniss plays to the cameras instead of to the arena.',
                '*Harry Potter:* Harry works out from the Mirror of Erised that Quirrell can only take the Stone by wanting to use it — so he wins by wanting only to find it.',
            ],
        },
        {
            id: 'villain-accuses', name: '"You Are the Same as Me"', nudge: true,
            why: 'so they must prove the difference by what they do next',
            val: 'neg',
            m: /accuses protagonist of being the same|not fooled|accuses opponents|opponent does not listen/i,
            tech: [{ s: 'Fl', l: 'Foil' }, { s: 'Dj', l: 'Duality' }],
            crit: [
                'the antagonist claims your protagonist is no different from them — and it should be PARTLY TRUE',
                'your protagonist’s answer is an action, not an argument: they prove the difference by what they do next',
            ],
            ex: '*Frankenstein:* the creature tells Victor they are bound together and equally guilty — and the book never quite disagrees.',
            more: [
                '*Great Expectations:* Magwitch tells Pip that convict money made him a gentleman — "I’m your second father" — and Pip cannot deny it, so his answer is to stay with him to the end.',
                '*The Lion King:* Scar tells Simba he is a murderer just like him — and Simba has believed exactly that for years.',
                '*Jekyll and Hyde:* Hyde is not a stranger arguing with Jekyll; the final confession admits they were one person the whole time.',
            ],
        },
        {
            id: 'nick-of-time', name: 'In the Nick of Time', nudge: false,
            why: 'so the escape is won by seconds, and the danger stays believable',
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
                '*Great Expectations:* Orlick has the hammer raised over Pip in the sluice-house when Herbert and Trabb’s boy break the door down — one second later and there is no ending.',
            ],
        },
        {
            id: 'fatal-blow', name: 'The Fatal Blow', nudge: false,
            why: 'so the monster dies by the hero\'s hand, in a scene we watch',
            val: 'pos',
            m: /fatal blow|final attempt|goal is won|allies pull out|emerges to win/i,
            tech: [{ s: 'Cl', l: 'Climax' }, { s: 'Og', l: 'Obligatory Scene' }],
            crit: [
                'the DECISIVE act — the one the whole story has promised, delivered on the page and not summarised',
                'your protagonist must be the one who does it',
            ],
            ex: '*The Lion King:* Simba throws Scar off the top of Pride Rock himself — the one act he had spent the whole film refusing.',
            more: [
                '*Macbeth:* "Lay on, Macduff" — Macbeth refuses to yield and walks into the fight himself rather than wait for it.',
                '*Harry Potter:* Harry holds on to Quirrell rather than let go — his own skin is the weapon, and he is the one using it.',
                '*Frankenstein:* Victor tears the half-finished bride apart in front of the creature — the one irreversible act he takes with his own hands.',
            ],
        },
        {
            id: 'tragic-acceptance', name: 'Accepting the Fate', nudge: false,
            why: 'so he faces the ending he made instead of being rescued',
            val: 'neg',
            m: /accepts his\/her fate|reflects on past mistakes|expresses regret|forces of opposition and fate/i,
            tech: [{ s: 'Ct', l: 'Catharsis' }, { s: 'Hm', l: 'Hamartia' }],
            crit: [
                'in a tragedy your protagonist SEES the truth too late — and goes on anyway',
                'the recognition is the payoff; do not soften it into a rescue',
            ],
            ex: '*Macbeth:* "I have lived long enough" — he understands exactly what he traded, and still walks out to fight.',
            more: [
                '*An Inspector Calls:* Eric accepts what he did while his parents are still arguing about whether it happened.',
                '*Of Mice and Men:* George knows exactly what he is about to do, and talks about the rabbits while he does it.',
                '*Jekyll and Hyde:* Jekyll’s last confession admits the change is now beyond his control, and he finishes writing anyway — the recognition arrives exactly too late to act on.',
            ],
        },

        // ───────────────────── STAGE VI — AFTERMATH ─────────────────────
        {
            id: 'final-image', name: 'The Final Image', nudge: true,
            why: 'so the reader SEES the change instead of being told about it',
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
                '*Of Mice and Men:* the same green pool the book opened on — two men walked in at the start, and only one of them walks back out alive.',
            ],
        },
        {
            id: 'how-much-learnt', name: 'How Much Have They Learnt?', nudge: false,
            why: 'so the story answers the question it asked at the start',
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
            why: 'so the reader sees the victory changed everyone, not just the hero',
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
            why: 'so the community gains something from the journey, not just the hero',
            val: 'pos', pri: 1,
            m: /returns with (the )?elixir|newfound wisdom|mastered himself|finds fulfillment/i,
            tech: [{ s: 'Mk', l: 'MacGuffin' }, { s: 'Sy', l: 'Symbolism' }],
            crit: [
                'they bring something BACK that the ordinary world needed — a truth, a person, a thing, a changed way of behaving',
                'make it visible: the elixir should be something a reader can point at',
            ],
            ex: '*A Christmas Carol:* Scrooge brings back Christmas itself — a turkey, a raised wage, and a nephew’s dinner accepted at last.',
            more: [
                '*Jane Eyre:* Jane returns to Ferndean with her own inheritance and becomes Rochester’s eyes and hand — the visible thing that house had lost.',
                '*Harry Potter:* Harry goes back to the Dursleys carrying the one thing he did not have in chapter one — somewhere else to belong.',
                '*Great Expectations:* what Pip brings back is the ability to see Joe clearly, which is the only fortune he ends the book with.',
            ],
        },
        {
            id: 'tragic-death', name: 'The Death, and the Response', nudge: true,
            why: 'so the flaw is paid for, and the story keeps its promise',
            val: 'neg',
            m: /is killed by forces|final act of violence|rejoice in or mourn|if they mourn|if they don’t learn|if they don't learn|same problem likely/i,
            tech: [{ s: 'Ct', l: 'Catharsis' }, { s: 'Th', l: 'Theme' }],
            crit: [
                'in a tragedy the end is a LOSS — and the meaning lives in how the survivors respond to it',
                'decide deliberately: do they learn, or does the problem stay loaded for the next person?',
            ],
            ex: '*Romeo and Juliet:* the families make peace over two bodies, and the play is careful to note the price of the lesson.',
            more: [
                '*Of Mice and Men:* only Slim understands what George did — Carlson’s closing "what the hell ya suppose is eatin’ them two guys?" shows nobody else ever will.',
                '*An Inspector Calls:* the phone rings again — the older Birlings have learnt nothing, and the whole night is about to happen for real.',
                '*Macbeth:* his head is carried on stage and Scotland gets a new king — the response is relief, not grief, which is its own verdict.',
            ],
        },

        // ═══════════════════════════════════════════════════════════════════════════════════
        // ⭐⭐ v7.20.408 — THE SEVENTEEN CONCEPTS THE MAP WAS MISSING (2026-08-03 audit)
        // ─────────────────────────────────────────────────────────────────────────────────
        // Fourteen of the seventeen are TRAGEDY, and that is the finding, not a coincidence.
        // Tragedy's rise beats exist to set up a FALL, so an archetype-blind resolver handed it
        // rise-story teaching almost every time: `nick-of-time` ("the win lands with nothing to
        // spare") claimed "Protagonist struggles to escape", coaching a RESCUE into a story that
        // must end in failure; `self-sacrifice` would have had a tragedy student write a
        // REDEMPTIVE death where the beat is pride carried to the end; `villain-weakness` claimed
        // the beat REVERSED, teaching the hero to read the villain's flaw when the beat is the
        // opponent reading the HERO's.
        //
        // Every one carries `arch` so it can never be served to a structure it is not for, and
        // every label also sits in ROWMAP so resolution does not depend on regex luck.
        // `tech` symbols are from the PROD allowlist (bin/cw6-prod-technique-symbols.txt) only.
        // Examples are canon-first per Neil's ruling (#210) and cast so the character actually
        // UNDERGOES the beat (#206b) — never one text twice inside a concept.

        {
            id: 'unlikeable-first', name: 'Unlikeable First', nudge: false, val: 'neg',
            arch: ['rebirth-redemption'],
            m: /unlikeable, inhumane|unlikeable qualities/i,
            tech: [{ s: 'Pr', l: 'Protagonist' }, { s: 'Fw', l: 'The Flaw' }],
            why: 'so the redemption lands — we must dislike him before he changes',
            crit: [
                'show him being COLD to someone who deserves better — an action, not a description of his personality',
                'make it small and ordinary: how he speaks to one person, what he refuses, what he does not notice',
                'leave ONE crack of warmth the reader can remember later — the change has to be believable, not invented',
            ],
            ex: '*A Christmas Carol:* Scrooge turns away the charity collectors and asks whether the prisons and workhouses are still in operation — his cruelty is a POSITION he argues for, not a mood.',
            more: [
                '*Pride and Prejudice:* Darcy refuses to dance with Elizabeth at the Meryton assembly and lets her overhear exactly why — the insult is careless, which makes it worse.',
                '*Beauty and the Beast:* the Beast turns an old woman away from his door in a storm because she is ugly — the whole curse follows from one act of contempt.',
                '*Silas Marner:* Silas hoards his gold and shuts the village out, counting coins nightly in place of company — a man who has replaced people with a substitute for them.',
            ],
        },
        {
            id: 'admirable-first', name: 'Admirable First', nudge: false, val: 'pos',
            arch: ['tragedy'],
            m: /admirable, humanistic|admirable, desirable|admirable qualities/i,
            tech: [{ s: 'Pr', l: 'Protagonist' }, { s: 'Hm', l: 'Hamartia' }],
            why: 'so the audience loves him first, and the fall actually hurts',
            crit: [
                'let OTHER people praise him before we meet him — reputation is more convincing than self-description',
                'show the quality in an ACTION, not a list of virtues',
                'plant the flaw INSIDE the strength: the same quality that is admired is the one that will destroy him',
            ],
            ex: '*Macbeth:* we hear of him before we see him — a captain reports his courage in battle and Duncan calls him valiant. The very boldness being praised is what the witches will later exploit.',
            more: [
                '*Romeo and Juliet:* Capulet, of all people, defends Romeo at the feast as a well-governed youth Verona is proud of — praise from an enemy carries further than praise from a friend.',
                '*Othello:* faced with the Senate and an accusation, Othello answers with calm authority and wins the room — the composure we admire is what makes his later loss of it terrible.',
                '*Doctor Faustus:* the Chorus introduces him as the pride of Wittenberg, a scholar who has outgrown every subject — and the restlessness behind that brilliance is the flaw.',
            ],
        },
        {
            id: 'dark-mentor', name: 'The Dark Mentor', nudge: false, val: 'neg',
            arch: ['tragedy'],
            m: /Dark Mentor awaits|meets the Dark Mentor/i,
            tech: [{ s: 'Mr', l: 'The Mentor' }, { s: 'Sd', l: 'The Shadow' }],
            why: 'so someone he trusts gives him permission to do the wrong thing',
            crit: [
                'a mentor TEACHES; a dark mentor gives PERMISSION — they tell him the thing he already wanted to hear',
                'they must be someone he trusts or loves, not an obvious villain — otherwise he would simply refuse',
                'they name his fear and reframe it as weakness, so acting badly starts to feel like courage',
            ],
            ex: '*Macbeth:* Lady Macbeth does not put the ambition there — it is already in his letter. She removes his last excuse, recasting his hesitation as cowardice until murder looks like proof of manhood.',
            more: [
                '*Oliver Twist:* Fagin feeds and shelters the boys and calls them his dears — the affection is what makes the theft feel like belonging rather than crime.',
                '*Doctor Faustus:* Mephistopheles answers every question honestly and still leads Faustus down, because Faustus only hears the half he wants.',
                '*Great Expectations:* Miss Havisham raises Estella to break hearts and calls it protection — the cruelty is taught as a kindness.',
            ],
        },
        {
            id: 'dark-mentor-faith', name: 'The Dark Mentor Believes in Him', nudge: false, val: 'neg',
            arch: ['tragedy'],
            m: /Dark Mentor has faith/i,
            tech: [{ s: 'Mr', l: 'The Mentor' }, { s: 'Di', l: 'Dramatic Irony' }],
            why: 'so the push toward ruin comes from someone he trusts and likes',
            crit: [
                'write it as genuine ENCOURAGEMENT — warm, certain, the kind anyone would want to hear',
                'the reader must see what he cannot: that being believed in is exactly what carries him over the edge',
                'do not make her sneer. The scene is far worse if she means it',
            ],
            ex: '*Macbeth:* Lady Macbeth tells him to screw his courage to the sticking place and promises they will not fail. It is real confidence in him — and it is the last push he needs.',
            more: [
                '*Doctor Faustus:* Mephistopheles assures Faustus that the powers he wants are within reach, and he is telling the truth — which is what makes it fatal.',
                '*Of Mice and Men:* Lennie believes in the farm completely, and his certainty keeps George holding a dream that cannot survive contact with the world.',
                '*Great Expectations:* Miss Havisham watches Estella practise coldness on Pip and is delighted with her — approval is the whole mechanism.',
            ],
        },
        {
            id: 'dark-mentor-falls', name: 'The Dark Mentor Falls', nudge: false, val: 'neg',
            arch: ['tragedy'],
            m: /Dark Mentor dies|Dark Mentor fights the opposition/i,
            tech: [{ s: 'Nm', l: 'Nemesis' }, { s: 'Ct', l: 'Catharsis' }],
            why: 'so he is left alone with the ruin his corrupter started',
            crit: [
                'this is NOT a hero surpassing a mentor — nothing is inherited and nothing is won',
                'what is removed is the last person who shared the guilt, so he now carries all of it',
                'show his REACTION, and make it too small: a man this far gone can no longer feel a death properly',
            ],
            ex: '*Macbeth:* the news of his wife’s death reaches him mid-siege and he cannot rise to it — he answers with tomorrow and tomorrow and tomorrow, a man for whom meaning has already drained out.',
            more: [
                '*Doctor Faustus:* the spirits that served Faustus so eagerly have nothing to offer in his final hour; the power leaves before he does.',
                '*Frankenstein:* by the time Victor is chasing the creature across the ice, everyone who might have shared his burden is dead because of it.',
                '*Great Expectations:* Miss Havisham dies in the fire of her own stopped house, leaving Estella and Pip holding a ruin neither of them chose.',
            ],
        },
        {
            id: 'doubling-down', name: 'Doubling Down', nudge: false, val: 'neg',
            arch: ['tragedy'],
            m: /Things out of control; retreats to false identity/i,
            tech: [{ s: 'Fw', l: 'The Flaw' }, { s: 'Ie', l: 'Internal vs External Conflict' }],
            why: 'so his refusal to drop the lie is what destroys him',
            crit: [
                'he is OFFERED a way back here — and he refuses it. Put the offer on the page so the refusal costs something',
                'he does not retreat quietly; he grips the lie HARDER, and it makes him act faster and worse',
                'this is the mirror of the rebirth story: the same moment, and he chooses the opposite way',
            ],
            ex: '*Macbeth:* with the country turning against him, he goes back to the witches for more prophecy rather than stop — he wants stronger reassurance, not the truth.',
            more: [
                '*An Inspector Calls:* Mr Birling responds to every new fact by insisting harder that he did nothing wrong, and ends the play unchanged while his children do not.',
                '*Jekyll and Hyde:* Jekyll swears the transformations are finished, then takes the draught again — each promise to stop is followed by a stronger dose.',
                '*Animal Farm:* every broken promise is met with a rewritten commandment rather than an admission — the story the pigs tell must never be allowed to fail.',
            ],
        },
        {
            id: 'dark-acts-escalate', name: 'The Acts Escalate', nudge: false, val: 'neg',
            arch: ['tragedy'],
            m: /compelled to commit 'dark acts'/i,
            tech: [{ s: 'Ra', l: 'Rising Action' }, { s: 'Cf', l: 'Conflict' }],
            why: 'so each crime forces the next, and turning back stops being possible',
            crit: [
                'the second act must be caused by the FIRST — he is protecting what he already did, not choosing freshly',
                'make each one costlier and less defensible than the last, so the reader watches a line move',
                'he should hesitate LESS each time. The speed of the decision is the character change',
            ],
            ex: '*Macbeth:* Duncan’s murder was agonised over for a whole act; Banquo’s is arranged briskly, and Macduff’s family are killed on impulse, for nothing.',
            more: [
                '*Crime and Punishment:* Raskolnikov kills the pawnbroker for a theory, then kills Lizaveta simply because she walks in — the second death has no argument behind it at all.',
                '*Frankenstein:* Victor abandons the creature, then refuses to make the companion he promised, and every death that follows grows out of that first walking away.',
                '*Animal Farm:* the executions in the yard follow from the confessions, and the confessions follow from a rule nobody can now question.',
            ],
        },
        {
            id: 'defending-the-prize', name: 'Defending the Prize', nudge: false, val: 'neg',
            arch: ['tragedy'],
            m: /preparations for defend|preparations to defend/i,
            tech: [{ s: 'Sk', l: 'Stakes' }, { s: 'Tn', l: 'Tension' }],
            why: 'so keeping the prize costs him more than winning it did',
            crit: [
                'he is no longer chasing anything — he is GUARDING, and guarding makes a person suspicious',
                'every precaution should create a new enemy, so the defending is what loses it',
                'show him watching someone he used to trust',
            ],
            ex: '*Macbeth:* barely crowned, he is already arranging Banquo’s murder — the throne is his, and holding it turns a friend into a threat overnight.',
            more: [
                '*Animal Farm:* the pigs surround themselves with dogs and rewrite the rules to protect what they have taken; each defence needs the next one.',
                '*Great Expectations:* Miss Havisham guards her stopped house so completely that preserving it becomes the thing that ruins Estella.',
                '*Richard III:* each rival removed makes the next removal necessary, until Richard is defending a crown against the very men who helped him take it.',
            ],
        },
        {
            id: 'flaw-exploited', name: 'The Flaw Turned Against Him', nudge: false, val: 'neg',
            arch: ['tragedy'],
            m: /opponent understands the protagonist's weakness|Opponent understands the protagonist/i,
            tech: [{ s: 'Hm', l: 'Hamartia' }, { s: 'Di', l: 'Dramatic Irony' }],
            why: 'so he is destroyed by his own flaw, not by chance',
            crit: [
                '⚠ this is the REVERSE of the hero working out the villain’s weakness — here the opposition reads HIM',
                'they use the flaw you planted in Stage I. If it is not already on the page, go back and plant it',
                'the trap should look like a gift: he must walk in gladly, believing he has won',
            ],
            ex: '*Macbeth:* the witches know his overconfidence better than he does, so they promise that no man of woman born can harm him — a truth shaped precisely to make him careless.',
            more: [
                '*Othello:* Iago never invents evidence; he simply feeds a jealousy that was already there and lets Othello do the rest.',
                '*Samson Agonistes:* Samson’s strength is never beaten in a fight — it is talked out of him by the one person he cannot refuse.',
                '*Frankenstein:* the creature knows exactly where Victor is soft and promises to be with him on his wedding night — the threat is aimed at love, not at life.',
            ],
        },
        {
            id: 'futile-struggle', name: 'The Struggle That Fails', nudge: false, val: 'neg',
            arch: ['tragedy'],
            m: /Protagonist struggles to escape/i,
            tech: [{ s: 'Ct', l: 'Catharsis' }, { s: 'Nm', l: 'Nemesis' }],
            why: 'so we watch him fight, and still lose — the loss has to be earned',
            crit: [
                '⚠ he does NOT get away. Do not write a narrow escape — this is the beat where the story keeps its promise',
                'let him fight WELL, so the defeat is not embarrassment but inevitability',
                'give him one moment where escape looks possible, then close it — hope makes the ending land',
            ],
            ex: '*Macbeth:* told at last that Macduff was untimely ripped from his mother’s womb, he knows the prophecy has turned — and still fights, choosing to die on his feet rather than yield.',
            more: [
                '*Of Mice and Men:* George runs to reach Lennie before the others do, and the best he can manage is to choose who does it and how.',
                '*Romeo and Juliet:* the friar sprints for the tomb with the truth in his hands and arrives minutes too late.',
                '*Frankenstein:* Victor pursues the creature to the Arctic and dies on the ice still chasing it — the pursuit was never winnable.',
            ],
        },
        {
            id: 'accusation-unheard', name: 'The Accusation Nobody Hears', nudge: false, val: 'neg',
            arch: ['tragedy'],
            m: /accuses his\/her opponents|Protagonist accuses opponents/i,
            tech: [{ s: 'Cf', l: 'Conflict' }, { s: 'Di', l: 'Dramatic Irony' }],
            why: 'so his last chance to be understood fails, and the fall completes',
            crit: [
                'he is RIGHT, and it changes nothing — that gap is the whole beat',
                'the accusation should be the truest thing he says in the play',
                'they do not argue back. They dismiss him, change the subject, or laugh — being ignored is worse than being answered',
            ],
            ex: '*An Inspector Calls:* Sheila and Eric tell their parents plainly that they are all guilty and nothing has been learned — and the Birlings pour drinks and congratulate themselves on the hoax.',
            more: [
                '*King Lear:* Lear rages at a storm about justice with more clarity than he ever had at court, and there is nobody in power left to hear it.',
                '*Animal Farm:* Clover recognises that the commandments have been altered, cannot read well enough to prove it, and the other animals move on.',
                '*The Crucible:* Proctor finally tells the court the truth about Abigail, and the court has already decided what kind of story it is hearing.',
            ],
        },
        {
            id: 'final-realisation', name: 'The Final Realisation', nudge: true, val: 'pos',
            valBy: { tragedy: 'neg' },
            m: /THIRD EPIPHANY/i,
            tech: [{ s: 'Ng', l: 'Anagnorisis' }, { s: 'Tu', l: 'Turning Point' }],
            why: 'so he finally understands the whole truth the journey was teaching',
            crit: [
                'unlike the earlier epiphanies, he understands ALL of it now — hold nothing back',
                'do not have him ANNOUNCE it. Show the understanding arriving through what he suddenly sees differently',
                'in a tragedy this same beat comes TOO LATE, and the understanding is the punishment',
            ],
            ex: '*A Christmas Carol:* standing over his own neglected grave, Scrooge finally grasps that the question was never money but whether anyone would grieve — and that he can still change the answer.',
            more: [
                '*Macbeth:* the tomorrow speech is the tragic version of this beat — complete understanding, arriving at the exact moment it can save nothing.',
                '*Great Expectations:* Pip sees that Magwitch, not Miss Havisham, made him a gentleman, and that everything he was ashamed of was the only thing given freely.',
                '*The Lion King:* Simba stops running when he understands his father is not gone but carried in him — and that returning is about who depends on him now.',
            ],
        },
        {
            id: 'the-reward', name: 'The Reward', nudge: false, val: 'pos',
            arch: ['rags-to-riches'],
            m: /win the prize', usually a rise|role in the "Kingdom"/i,
            tech: [{ s: 'Rn', l: 'Resolved Ending' }, { s: 'Cy', l: 'Cyclical Structure' }],
            why: 'so the ending repays everything the lowly opening made us want for them',
            crit: [
                'make the reward SPECIFIC — a position, a name, a place at a table, not "happiness"',
                'it must answer the exact lack you opened with, so the reader feels the circle close',
                'the person they were in Stage I could not have held this. Show why they can now',
            ],
            ex: '*Jane Eyre:* Jane returns to Rochester with her own inheritance and her own terms — the orphan who had no standing arrives as an equal, which is the only way the marriage could be right.',
            more: [
                '*Oliver Twist:* Oliver’s parentage is restored and with it a family — the workhouse boy is finally given a name that was his all along.',
                '*Cinderella:* the slipper fits in front of the household that made her invisible; being SEEN is the prize, and the marriage only confirms it.',
                '*David Copperfield:* David ends with work he chose, a name he made and Agnes beside him — everything the boy in the bottling factory had no way to reach.',
            ],
        },
        {
            id: 'the-prize-won', name: 'The Prize Is Won', nudge: false, val: 'pos',
            arch: ['overcoming-the-monster', 'the-quest'],
            m: /Hero emerges to 'win the prize'$|Hero emerges to win the prize$/i,
            tech: [{ s: 'Og', l: 'Obligatory Scene' }, { s: 'Rn', l: 'Resolved Ending' }],
            why: 'so the reader finally gets the payoff the whole story promised',
            crit: [
                'this is the CLAIMING, not the fight — the blow already landed in the previous beat, so do not rewrite it',
                'the prize must be the thing set up at the very start, or the ending will feel like a different story',
                'show it being TAKEN or GIVEN in front of people. A reward nobody witnesses does not feel won',
            ],
            ex: '*The Lion King:* Simba climbs Pride Rock and roars — the kingship was decided when Scar fell, and this is the moment the pride, and the reader, receive it.',
            more: [
                '*Beowulf:* Grendel’s arm is hung in the hall where the terror happened, so the proof stands in the place the fear used to.',
                '*The Hobbit:* Bilbo takes only a small share of the treasure, and the choosing tells us more about who he has become than the hoard ever could.',
                '*The Odyssey:* Odysseus takes back his hall, his bow and his wife — the prize was never treasure, it was the home the whole journey was measured against.',
            ],
        },
        {
            id: 'allies-pay-off', name: 'The Allies Pay Off', nudge: false, val: 'pos',
            m: /allies pull out their own bag of tricks|Allies pull out their own/i,
            tech: [{ s: 'Aa', l: 'Ally' }, { s: 'Ck', l: 'Setup & Payoff' }],
            why: 'so every ally you introduced earns their place in the ending',
            crit: [
                '⚠ this beat is the ALLIES acting, not your protagonist — do not give the moment away to the hero',
                'each ally uses the exact skill you introduced them with. If one has no skill yet, go back and give them one',
                'their help must COST them something, or it reads as convenience',
            ],
            ex: '*Harry Potter and the Philosopher’s Stone:* Hermione solves the potions riddle and Ron sacrifices himself at chess — each does the thing they were established doing, and Harry reaches the last room because of them.',
            more: [
                '*The Lion King:* Timon and Pumbaa draw the hyenas away — the comic pair are useful precisely because being underestimated is their whole character.',
                '*The Hobbit:* Bard brings down Smaug with the black arrow, using knowledge the townspeople had all along while the dwarves were elsewhere.',
                '*The Wizard of Oz:* the Scarecrow plans the rescue, the Tin Man carries it out and the Lion leads it — each uses the very quality he believed he lacked.',
            ],
        },
        {
            id: 'tests-and-learning', name: 'Tests, Allies and Enemies', nudge: false, val: 'neu',
            arch: ['overcoming-the-monster'],
            m: /experimenting and learning from the tests|experimenting and learning/i,
            tech: [{ s: 'Ra', l: 'Rising Action' }, { s: 'Aa', l: 'Ally' }],
            why: 'so the hero earns the skills the final fight will demand',
            crit: [
                'this is LEARNING, not just difficulty — he must end each test knowing something he did not know',
                'have him get one thing WRONG and learn more from it than from the wins',
                'whatever he learns here is what beats the monster later. Decide that now and plant it',
            ],
            ex: '*The Hunger Games:* Katniss spends training hiding what she can really do and reading the others instead — the watching, not the weapons, is what keeps her alive in the arena.',
            more: [
                '*Harry Potter and the Philosopher’s Stone:* the trapdoor is passed with the lessons of the school year — a charm, a plant, a game of chess — each one taught on the page before it is needed.',
                '*The Odyssey:* every island costs Odysseus something and teaches him the same lesson in a harder form: cunning outlasts strength.',
                '*The Hobbit:* the riddle game with Gollum teaches Bilbo that he can win with his wits, which is the only weapon he will have at the end.',
            ],
        },
        {
            id: 'separation-from-what-matters', name: 'Separated From What Matters', nudge: false, val: 'neg',
            arch: ['rags-to-riches', 'the-quest'],
            m: /separated from what has become important|separated from what's important/i,
            tech: [{ s: 'Sk', l: 'Stakes' }, { s: 'Ie', l: 'Internal vs External Conflict' }],
            why: 'so losing what mattered most forces them to prove who they really are',
            crit: [
                'it need not be a person — it can be a place, an object, or a version of themselves they liked',
                'the loss should come from something THEY did, so it is a consequence and not bad luck',
                'show them reaching for it out of habit and finding it gone',
            ],
            ex: '*Great Expectations:* Pip, ashamed of Joe in London, drives away the one person who loved him without conditions — and only understands what he has lost when Joe nurses him and quietly leaves.',
            more: [
                '*The Wizard of Oz:* Dorothy is separated from her companions at the witch’s castle and has to act without the courage, heart and brains she had been borrowing.',
                '*Little Women:* Jo sells her hair and then loses Beth — the second loss shows her what the first one was only practice for.',
                '*The Hobbit:* lost from the company in Mirkwood, Bilbo faces the spiders with nobody to hide behind, and finds out who he is without them.',
            ],
        },

        // ── The last two of the 2026-08-03 audit's open calls: beats that were sharing a card
        //    with a neighbour whose teaching contradicted them. See the block above for the rest.
        {
            id: 'second-epiphany', name: 'The Second Epiphany', nudge: true, val: 'neu',
            why: 'so he stops reacting to the story and starts choosing what happens next',
            m: /SECOND EPIPHANY/i,
            tech: [{ s: 'Tu', l: 'Turning Point' }, { s: 'Ng', l: 'Anagnorisis' }],
            crit: [
                'the FIRST epiphany was about the world; this one is about HIMSELF — he sees his own part in it',
                'it must change how he ACTS, not just how he feels: reactive before, deliberate after',
                'this is the midpoint hinge. If nothing about his behaviour is different after it, it has not happened',
            ],
            ex: '*A Christmas Carol:* it is not the sight of the past that turns Scrooge but seeing himself in it — the boy left at school, the man Belle walked away from. The realisation is about who he became.',
            more: [
                '*Great Expectations:* Pip realises his shame about Joe is not about Joe at all, and that the gentleman he has been building is a costume.',
                '*Jane Eyre:* Jane grasps that staying with Rochester would cost her the self-respect the whole novel has been about — and acts on it that night.',
                '*The Lion King:* Simba admits to Nala that he is not staying away because he cannot go back, but because he cannot face what he believes he did.',
            ],
        },
        {
            id: 'mentor-sacrifice', name: 'The Mentor\u2019s Sacrifice', nudge: false, val: 'neg',
            why: 'so the hero carries a debt into the final fight, not just an absence',
            m: /Mentor sacrifices himself|mentor sacrifices him\/herself/i,
            tech: [{ s: 'Mr', l: 'The Mentor' }, { s: 'Sk', l: 'Stakes' }],
            crit: [
                'this is NOT the same as a mentor simply dying — the death BUYS the protagonist something',
                'the hero must know it was for them. Grief plus DEBT is what changes the final fight',
                'give them one thing the mentor left behind — a word, an object, an instruction — to carry into the climax',
            ],
            ex: '*Harry Potter and the Philosopher\u2019s Stone:* Ron takes the knight\u2019s blow so Harry can reach the next room — Harry walks on knowing the way through was paid for.',
            more: [
                '*The Lion King:* Mufasa dies reaching for Simba, and Simba spends the rest of the film carrying a debt he believes he can never repay.',
                '*A Tale of Two Cities:* Carton takes Darnay\u2019s place at the guillotine, and the life Darnay goes on to live is not entirely his own.',
                '*The Hobbit:* Thorin\u2019s dying words release Bilbo from the quarrel, and Bilbo goes home carrying a blessing rather than a grudge.',
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


    // ═══════════════════════════════════════════════════════════════════════════════════════
    // ⭐⭐ ROWMAP — v7.20.408. THE AUDITED EXCEPTIONS. Read before adding an entry.
    // ───────────────────────────────────────────────────────────────────────────────────────
    // On 2026-08-03 Neil tapped [Examples] on rebirth-redemption's "Protagonist presented with
    // unlikeable, inhumane qualities" and got the FALSE IDENTITY panel. That triggered a full
    // audit: five Opus subagents judged every one of the 232 distinct (beat label → concept)
    // pairs behind the 801 askable rows. **82 of 232 (35%) were wrong or weak** — a shared
    // concept teaching a different beat, sometimes the OPPOSITE beat (`nick-of-time`, which
    // teaches "the win lands with nothing to spare", claimed tragedy's "Protagonist struggles
    // to escape", coaching a rescue into a story that must end in failure).
    //
    // WHY A TABLE AND NOT MORE REGEX. The regex map is a good matcher and a bad adjudicator:
    // every previous fix bolted another alternation onto whichever concept was losing, which is
    // exactly how `false-identity` ended up claiming "unlikeable, inhumane" and "admirable,
    // desirable" — two beats that have nothing to do with a mask. Tuning 70 regexes against 232
    // rows makes each fix able to break a row nobody is looking at. These 55 rows are AUDITED
    // JUDGEMENTS, so they are written down as judgements: greppable, reviewable, and checked by
    // bin/cw6-concept-lint.js (every `l` must exist in the templates, every `id` must exist,
    // and no entry may be dead).
    //
    // ⚠️ THIS IS NOT A LICENCE TO AUTHOR PER ROW (WML CLAUDE.md §4c.9). The default path is
    // still label+prompt → regex → concept. An entry belongs here only when a HUMAN-AUDITED
    // decision says the automatic match is wrong. If you find yourself adding many at once, the
    // concept is missing — author the concept instead (that is what the 17 new ones were for).
    //
    // `arch` is optional: omit it when the correction holds for every archetype the label
    // appears in (all 55 below), set it when a label means different things per structure.
    const ROWMAP = [

        // → allies
        { l: 'Small group of allies may welcome the protagonist', id: 'allies' },   // was `threshold` — Matched on the words 'into the special world' only. The beat is about WHO welcomes him; threshold teaches the physical crossing and gives no help desi
        { l: 'Small group of allies welcomes the Hero', id: 'allies' },   // was `threshold` — Same false match on 'into the special world'. Also note the archetype split: in tragedy this welcoming group flatters and enables rather than supports

        // → approach
        { l: 'Approach to the inmost cave', id: 'approach' },   // was `underworld` — this beat is the preparation to go down; the journey itself is a separate beat already using this concept
        { l: 'Final nightmare battle approaches', id: 'approach' },   // was `nightmare-battle` — the beat is the run-up and preparation; the fight itself is a separate beat already using this concept
        { l: 'Final supreme battle approaches', id: 'approach' },   // was `nightmare-battle` — the beat is the run-up and preparation; the fight itself is a separate beat already using this concept
        { l: 'Final supreme ordeal approaches', id: 'approach' },   // was `nightmare-battle` — the beat is the run-up and preparation; the fight itself is a separate beat already using this concept

        // → cornered
        { l: 'Forces of opposition and fate closing in', id: 'cornered' },   // was `tragic-acceptance` — Tragic Acceptance is about recognition — seeing the truth too late and going on. This beat is external pressure tightening, before any recognition. Co

        // → epiphany
        { l: 'Hero has increased awareness of need to change', id: 'epiphany' },   // was `world-deteriorates` — the beat is his growing recognition, not the world visibly worsening
        { l: 'Something reminds protagonist of need to change', id: 'epiphany' },   // was `dark-force-rising` — the beat is an inner click triggered by something he sees; the concept teaches the opposition growing
        { l: 'Suddenly realises things will never be the same', id: 'epiphany' },   // was `lowest-point` — this is a RECOGNITION beat, not a despair beat; lowest-point's 'strip the ally, mask goes back on' does not teach how to write a realisation landing o

        // → false-balance
        { l: 'Protagonist sees life as oppressive, even though has a lot', id: 'false-balance' },   // was `figurative-death` — Beat is about restless appetite despite plenty — the discontent that feeds the tragic ambition. The concept asks the student to name a LOSS, which is 

        // → fatal-blow
        { l: 'Dark forces are dealt a fatal blow', id: 'fatal-blow' },   // was `nick-of-time` — nick-of-time teaches only the TIMING; the beat's job is the decisive act itself, and fatal-blow ('your protagonist must be the one who does it') is th
        { l: 'Dark forces dealt a fatal blow; goal is won', id: 'fatal-blow' },   // was `nick-of-time` — same over-claim: fatal-blow's regex matches both 'fatal blow' and 'goal is won', and it teaches the decisive act; nick-of-time teaches only pace.
        { l: 'Monster is dealt a fatal blow', id: 'fatal-blow' },   // was `nick-of-time` — the beat is the kill, not the clock; fatal-blow teaches that the protagonist must land it on the page rather than have it summarised.

        // → figurative-death
        { l: 'Mentor informs of consequences if they do not change', id: 'figurative-death' },   // was `dark-force-rising` — the beat is the mentor naming what he loses by staying the same, not the opposition widening its reach
        { l: 'Protagonist overshadowed by dark figures', id: 'figurative-death' },   // was `oppression` — the beat is what living in their shadow costs HIM; the concept points the student at everyone else
        { l: 'Protagonist overshadowed by oppressive life', id: 'figurative-death' },   // was `oppression` — the beat is what the oppressive life costs HIM; the concept points the student at everyone else
        { l: 'Someone shows him the consequences of his actions', id: 'figurative-death' },   // was `guidance` — the beat needs the consequence shown concretely; the concept teaches a quiet conversation and models nothing shown

        // → final-image
        { l: 'Final Image: opposite of Opening Image', id: 'final-image' },   // was `opening-image` — the /opening image/i regex claims the row because the label contains the words; the final-image concept exists and teaches exactly this beat (mirror t

        // → foreshadow
        { l: 'A random ally appears; will return later', id: 'foreshadow' },   // was `allies` — Concept teaches team design (each ally good at something you are not); the beat's whole point is that this ally LEAVES and returns at the worst moment

        // → gratification
        { l: 'Hero seeks harmful gratification; community suffers', id: 'gratification' },   // was `oppression` — here the protagonist IS the cause of the suffering; the concept teaches an outside force pressing on the community

        // → herald
        { l: 'Dark Herald guides protagonist to meet the Dark Mentor', id: 'herald' },   // was `mentor` — three consecutive tragedy beats all resolve to mentor; this one belongs to the Herald, and herald exists
        { l: 'Herald guides protagonist to meet the Mentor', id: 'herald' },   // was `mentor` — the beat's subject is the messenger who brings him, not the mentor he meets two beats later

        // → how-much-learnt
        { l: 'Hero appears whole for all the future', id: 'how-much-learnt' },   // was `balance-restored` — Beat is the protagonist made permanently whole; the concept explicitly teaches the WORLD after, 'not just your protagonist' — the opposite emphasis.

        // → limited-awareness
        { l: 'Protagonist in state of youthful naivety, lacking responsibility', id: 'limited-awareness' },   // was `ordinary-world` — The prompt opens with the words 'has limited awareness'. limited-awareness teaches it AND fixes the row's own failing — 'show it through a mistake or 

        // → lowest-point
        { l: 'Protagonist overwhelmed with despair; retreats to false identity', id: 'lowest-point' },   // was `false-identity` — Concept teaches ESTABLISHING the mask in Act 1; this is the despair-driven RELAPSE. lowest-point literally names it — 'the goal looks lost and the mas

        // → monster-distant
        { l: 'A shadowy figure may appear', id: 'monster-distant' },   // was `shadow-dominates` — The concept teaches total domination ('the opposition is now the STRONGEST thing in your story'); this beat is a single glimpse of something that 'may
        { l: 'Protagonist has increased awareness of dangers ahead', id: 'monster-distant' },   // was `world-deteriorates` — the beat is what he learns about the threat ahead, not a world getting worse
        { l: 'Protagonist has increased awareness of the monster', id: 'monster-distant' },   // was `world-deteriorates` — the beat is the threat becoming known before it is ever seen, not the world worsening

        // → nightmare-battle
        { l: 'Monster attacks the protagonist in final attempt', id: 'nightmare-battle' },   // was `fatal-blow` — The beat is the MONSTER attacking; the concept teaches the protagonist's own decisive act ('your protagonist must be the one who does it'). nightmare-

        // → object-of-desire
        { l: 'Goal becomes much more specific', id: 'object-of-desire' },   // was `approach` — Beat sits in Stage III where the goal merely sharpens; the concept's 'last stretch is the worst / preparations before going in' half is a Stage V appr

        // → obstacles
        { l: 'Attacked again; resistance does not work', id: 'obstacles' },   // was `physical-attack` — The concept is literally 'The First Attack' and teaches 'the opposition touches them for the FIRST time' — this beat is explicitly 'attacked AGAIN'. T
        { l: 'More obstacles, crises and conflicts; thrilling escape', id: 'obstacles' },   // was `nick-of-time` — this sits at STAGE III (escalation), not the finale — nick-of-time claimed it on the words 'thrilling escape'. The beat's job is rising obstacles, whi
        { l: 'Obstacles, betrayal, crises and conflicts', id: 'obstacles' },   // was `nick-of-time` — STAGE III escalation beat mis-claimed by 'thrilling escape'; obstacles teaches escalation, and the betrayal clause is served by the betrayal concept, 
        { l: 'Obstacles, crises and conflicts ending in thrilling escape', id: 'obstacles' },   // was `nick-of-time` — same STAGE III mis-claim: the row is about mounting obstacles, and nick-of-time only teaches the last-second win.

        // → powerless
        { l: 'He encounters inner demons and temptations', id: 'powerless' },   // was `underworld` — the beat is inner vacillation between two selves; the concept teaches a physical dark setting

        // → problem-snapshot
        { l: 'Dark figures mistreat the protagonist', id: 'problem-snapshot' },   // was `oppression` — the concept teaches pressure on everyone AROUND the protagonist; this beat is his own mistreatment

        // → prophecy
        { l: 'Given supernatural or visionary direction; ONLY HE/SHE can solve it', id: 'prophecy' },   // was `call-to-adventure` — The generic Call is already covered by the 'INCITING INCIDENT' row in the same stage; what is distinctive here — a visionary/prophetic message and the
        { l: 'May contact spirits who give strange or mistaken guidance', id: 'prophecy' },   // was `guidance` — misleading supernatural promises are prophecy's subject, and its criteria teach the double edge this beat needs
        { l: 'Protagonist receives apparent wisdom and ambiguous gifts', id: 'prophecy' },   // was `the-sword` — The word 'apparent' and 'ambiguous' is the whole beat — a tragedy gift that is double-edged and misleads him. The Gift teaches an object that MEANS th

        // → refusal
        { l: 'Compelled to run away from the truth', id: 'refusal' },   // was `lowest-point` — missing how to write avoidance: lowest-point teaches the bottom (goal lost, ally stripped), but this beat is a second refusal — refusal teaches saying
        { l: 'Protagonist refuses again; stuck in ordinary world', id: 'refusal' },   // was `ordinary-world` — The beat is a SECOND refusal; ordinary-world teaches establishing normal life in Act 1. refusal teaches the move, including the action ('they go back,

        // → sees-way-to-fix
        { l: 'Protagonist makes preparations to change', id: 'sees-way-to-fix' },   // was `approach` — Same 'preparations' regex sweep. There is no external goal in sight here — the preparation is internal and rebirth-only. 'A Way to Fix It' (a decision

        // → seizes-sword
        { l: 'In the nick of time, the protagonist changes', id: 'seizes-sword' },   // was `nick-of-time` — the beat is the REDEMPTION TURN, not an escape; nick-of-time teaches escape timing and short sentences, which gives a rebirth student nothing. seizes-

        // → shadow-dominates
        { l: 'Face to face with the Monster and its awesome power', id: 'shadow-dominates' },   // was `nightmare-battle` — this beat reveals the monster's scale; the fight where the old self dies is a later beat already using this concept
        { l: 'The hero seems tiny and alone', id: 'shadow-dominates' },   // was `powerless` — Overcoming-the-monster, Stage IV: nothing to do with a false identity or a mask. The beat is scale and isolation against a monster at its strongest — 

        // → storm-coming
        { l: 'Tension begins to rise', id: 'storm-coming' },   // was `balance-deteriorates` — the previous beat already uses this concept; rising tension is atmosphere, not the one thing that broke

        // → threshold
        { l: 'Hero becomes committed to his course of action', id: 'threshold' },   // was `approach` — Beat is the point of no return, not sighting a goal; only the concept's 'what they decide or give up' line touches it. Threshold teaches the irreversi

        // → tragic-acceptance
        { l: 'Protagonist decides to die with honour and glory', id: 'tragic-acceptance' },   // was `self-sacrifice` — self-sacrifice teaches surrender as 'the proof of the change' — but in tragedy dying for honour is the FLAW carried to the end, not growth. The concep

        // → villain-accuses
        { l: 'Dark forces accuse protagonist of being the same; not fooled', id: 'villain-accuses' },   // was `fatal-blow` — There is an exact concept already — villain-accuses ('You Are the Same as Me': the claim should be PARTLY TRUE, and the answer is an action not an arg

        // → warning-ignored
        { l: 'Mentor warns about going against their advice', id: 'warning-ignored' },   // was `mentor` — the beat is the warning itself; the concept re-teaches who the mentor is, which the student has already written
        { l: 'Obstacles and crises; more chances to change', id: 'warning-ignored' },   // was `obstacles` — Escalation is only half the beat. The rebirth-specific half — repeated chances and reasons to change, which he keeps waving away — is taught by Warnin
        { l: 'Protagonist receives a warning; threat becomes visible', id: 'warning-ignored' },   // was `monster-distant` — Concept teaches WITHHOLDING the threat ('the less you show, the larger it feels') — the exact opposite of a beat where the threat becomes visible and 
        { l: 'Protagonist sees more signs why he needs to change', id: 'warning-ignored' },   // was `world-deteriorates` — at this stage he sees the signs and still does nothing; the concept says nothing about ignoring them

        // → world-deteriorates
        { l: 'But things continue to go wrong', id: 'world-deteriorates' },   // was `mood-turns` — 'Continue' means this is the second, deeper decline; mood-turns teaches a one-time shift in FEEL and tells the student to compare against an earlier s

        // → the 17 concepts authored 2026-08-03 (see the block in CONCEPTS)
        { l: 'Protagonist accuses opponents; opponent does not listen', id: 'accusation-unheard' },
        { l: 'Protagonist presented with admirable, desirable qualities', id: 'admirable-first' },
        { l: 'Allies pull out their own bag of tricks', id: 'allies-pay-off' },
        { l: 'Compelled to commit dark acts', id: 'dark-acts-escalate' },
        { l: 'Protagonist meets the Dark Mentor; overcoming fear', id: 'dark-mentor' },
        { l: 'The Dark Mentor awaits', id: 'dark-mentor' },
        { l: 'Dark Mentor has faith protagonist will overcome', id: 'dark-mentor-faith' },
        { l: 'Dark Mentor dies', id: 'dark-mentor-falls' },
        { l: 'Dark Mentor fights the opposition and loses', id: 'dark-mentor-falls' },
        { l: 'Hero makes preparations to defend winnings', id: 'defending-the-prize' },
        { l: 'Things out of control; retreats to false identity', id: 'doubling-down' },
        { l: 'THIRD EPIPHANY: enlightened, possibly via redemption figure', id: 'final-realisation' },
        { l: 'THIRD EPIPHANY: protagonist becomes enlightened', id: 'final-realisation' },
        { l: 'Opponent understands the protagonist\'s weakness', id: 'flaw-exploited' },
        { l: 'Protagonist struggles to escape', id: 'futile-struggle' },
        { l: 'Hero becomes separated from what\'s important', id: 'separation-from-what-matters' },
        { l: 'Protagonist experimenting and learning from tests', id: 'tests-and-learning' },
        { l: 'Hero emerges to win the prize', id: 'the-prize-won' },
        { l: 'Hero emerges to win the prize; role in the Kingdom', id: 'the-reward' },
        { l: 'Protagonist presented with unlikeable, inhumane qualities', id: 'unlikeable-first' },
    ];
    // Exact-label lookup, optionally archetype-scoped. Runs BEFORE the regex sweep.
    function rowMapFor(label, archetypeKey) {
        if (!label) return null;
        for (let i = 0; i < ROWMAP.length; i++) {
            const e = ROWMAP[i];
            if (e.l !== label) continue;
            if (e.arch && archetypeKey && e.arch.indexOf(archetypeKey) === -1) continue;
            for (let k = 0; k < CONCEPTS.length; k++) if (CONCEPTS[k].id === e.id) return CONCEPTS[k];
            return null;   // a dead id is a lint failure, never a silent miss
        }
        return null;
    }

    // ⚠️ PRIORITY, and why it exists. `conceptFor()` originally took the FIRST regex match over this
    // array, and the order was never checked for specificity — so six concepts were UNREACHABLE: 63
    // rows across the 8 templates resolved to a more general concept that appears earlier, and served
    // its criteria, its worked example and its technique chips instead. The worst was 24 rows of
    // "Hero surpasses the Mentor" being told a mentor is "someone who has BEEN where your
    // protagonist is going" — the opposite of what that beat asks for. `pri: 1` lifts a specific
    // concept above the general one that was eating it. Enforced by bin/cw6-outline-harness.js,
    // which now FAILS if any concept wins zero rows.
    //
    // ═══════════════════════════════════════════════════════════════════════════════════════
    // ⭐⭐ v7.20.408 — THIS IS THE ONE RESOLVER. There used to be TWO, and they disagreed.
    // ───────────────────────────────────────────────────────────────────────────────────────
    // `_cw6ConceptFor` in wml-assessment.js resolved LONGEST-MATCH-WINS (the v7.20.391 fix for
    // `/opening image/i` swallowing "expand on the opening image"). This function still resolved
    // FIRST-MATCH-BY-`pri`. Both were live: the walk and the [Examples] panel used the former,
    // the beat VALENCE DOT used the latter. Measured on the real templates, they picked a
    // DIFFERENT concept on **41 of the 232 askable beats** — so a row could show a valence
    // derived from one concept and examples derived from another ("Allies abandon the
    // protagonist": valence from `allies`, teaching from `allies-disagree`).
    // The .391 note claiming "ONE MATCHER" was true of the walk's private copy only; the
    // concepts file kept its own. That is exactly the averaged-conflicting-patterns failure
    // CLAUDE.md §7 forbids, so there is now ONE implementation and wml-assessment.js delegates.
    //
    // THE RULE: longest matched substring wins → tie broken by higher `pri` → tie broken by
    // array order. (Longest-match is kept because it is what the shipped walk did, what
    // bin/cw6-concept-lint.js mirrors, and what the 2026-08-03 242-pair audit judged against.)
    //
    // ⭐ `arch` — ARCHETYPE SCOPING (the 2026-08-03 root fix). A concept may declare
    // `arch: ['tragedy']` meaning "this beat only exists in these plot structures". The resolver
    // was archetype-BLIND, so a shared concept could claim a one-archetype beat and there was no
    // way to say otherwise — the defect Neil found (rebirth-redemption's "unlikeable, inhumane"
    // served the False Identity mask card) and the reason `false-identity` had two foreign
    // branches bolted onto its regex.
    // Scoping is a SAFETY NET, not the matching mechanism: bin/cw6-concept-lint.js fails the
    // build if a scoped concept's regex fires on a row outside its scope. That is why an unknown
    // archetypeKey does NOT exclude scoped concepts — the regex is already proven specific, so
    // degrading to today's behaviour is safe rather than leaving the beat with no concept at all.
    function conceptFor(label, prompt, archetypeKey) {
        // The 55 audited exceptions win over the regex sweep — see ROWMAP above.
        const fixed = rowMapFor(label, archetypeKey);
        if (fixed) return fixed;
        const hay = (label || '') + ' — ' + (prompt || '');
        let best = null, bestLen = -1;
        for (let k = 0; k < CONCEPTS.length; k++) {
            const c = CONCEPTS[k];
            // Out-of-scope only when we actually KNOW the archetype (see the note above).
            if (c.arch && archetypeKey && c.arch.indexOf(archetypeKey) === -1) continue;
            const m = hay.match(c.m);
            if (!m) continue;
            const len = (m[0] || '').length;
            if (len > bestLen || (len === bestLen && (c.pri || 0) > (best.pri || 0))) {
                best = c; bestLen = len;
            }
        }
        return best;
    }
    // The whole point of deriving this at RENDER time rather than baking it into the saved
    // document: the outline scaffold is baked, so a stamped attribute would style only NEW
    // documents and leave every existing one needing a migration
    // (reference_wml_outline_scaffold_baked_needs_onload_heal). Resolved from the criterion the
    // NodeView already holds, every valence edit reaches every existing document on next load,
    // and nothing is written to a ProseMirror node at all.
    // ⭐⭐ v7.20.408 — WHY THIS BEAT EXISTS (Neil, 2026-08-03).
    // *"Do you think we should have a why with each beat? … I think we need to have a why with each
    // beat. At least in the panels, probably in the chat as well."*
    //
    // ⚠️ THE CONSTRAINT THAT DECIDES HOW IT IS RENDERED, and Neil caught it before it shipped:
    // *"The student cannot write 'so the redemption lands'. It needs to be shown and not told in
    // the actual writing."* The why is BEHIND-THE-CURTAIN craft knowledge for the student's
    // understanding — it is NOT beat content and must never end up in their outline. A fourteen-
    // year-old who reads "so the redemption lands" directly above an empty box will either type it
    // in or write tell-y prose ("this shows he will be redeemed"). So every surface that renders a
    // why MUST label it as authorial purpose, keep it visually outside the criteria the student is
    // working to, and carry the show-don't-tell line. See _cw6BeatHelpHTML.
    //
    // `whyBy` mirrors `valBy`: the same beat can do a genuinely different JOB per structure —
    // tragedy's rise beats exist to set up a fall, so "so the change is proved" becomes "so the
    // power he finds is the power to destroy himself". 11 concepts carry an override.
    function whyFor(label, prompt, archetypeKey) {
        const c = conceptFor(label, prompt, archetypeKey);
        if (!c || !c.why) return '';
        const over = c.whyBy && archetypeKey && c.whyBy[archetypeKey];
        return over || c.why;
    }
    function valenceFor(label, prompt, archetypeKey) {
        // v7.20.408: passes archetypeKey THROUGH to the resolver now. It always had the key and
        // used it only for the `valBy` override, while resolving the concept blind — so on the 41
        // divergent beats the dot described a different concept from the one the [Examples] panel
        // opened. One resolver, one archetype, one answer.
        const c = conceptFor(label, prompt, archetypeKey);
        if (!c || !c.val) return '';
        const over = c.valBy && archetypeKey && c.valBy[archetypeKey];
        return over || c.val;
    }

    window.WML_CW6_CONCEPTS = { STAGES: STAGES, CONCEPTS: CONCEPTS, VALENCES: VALENCES, ROWMAP: ROWMAP,
        conceptFor: conceptFor, valenceFor: valenceFor, whyFor: whyFor };
})();
