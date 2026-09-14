<?php
/**
 * Seed Neil's IGCSE Spec A Lang P1 assessment document on STAGING so he can drive the
 * assessment walk without writing a whole paper first.
 *
 * Answers are deliberately MID-QUALITY (roughly grade 5-6) with planted, specific flaws, so the
 * marking has something to bite on and the feedback/gold-rewrite path is exercised:
 *   - Q2 makes 3 clear points where 4 are available  -> tests partial credit on a point-marked Q
 *   - Q4 paragraph 3 is thin (assertion, no close analysis) -> tests per-paragraph granularity
 *   - Q5 BODY 2 IS DELIBERATELY ONE-SIDED (Text One only) -> tests the NEW per-text criteria and
 *     the one-text/balance rule that v7.20.618 added. This is the single most important seed.
 *   - Q6 is competent but light on counter-argument -> tests the IUMVCC beat feedback
 * Every quotation is verbatim from the two source texts in this topic.
 */

$BR = '<br><br>';
$answers = [];

// Q1 (2) — list two words/phrases suggesting disconnection. Both verbatim from Text One.
$answers['Q1-response'] =
    '1. &quot;occupy different planets&quot;' . $BR .
    '2. &quot;utter hopelessness and disenfranchisement&quot;';

// Q2 (4) — own words, no quotes. THREE clear points where four are available (31 years, cash
// purchase, 22 rival cash buyers, the deliberate juxtaposition). The missing one is the "22 other
// cash buyers" detail, so partial credit should be visible.
$answers['Q2-response'] =
    'Fletcher is pointing out how enormous the gap between rich and poor in London has become. '
  . 'He explains that one property on a very expensive shopping street was bought outright, with the '
  . 'money paid immediately rather than borrowed, for a sum most people could never imagine earning.' . $BR
  . 'He then sets against this the situation of an ordinary worker, who would have to put aside every '
  . 'single penny of their wages for over thirty years before they could afford a house in the same city.' . $BR
  . 'By placing these two facts side by side, he wants the reader to see that the rich and the poor in '
  . 'London are not really living in the same place at all.';

// Q3 (5) — brief embedded quotations, five distinct points.
$answers['Q3-response'] =
    'Fletcher feels that the main cause of the riots is inequality. He describes the '
  . '&quot;inconceivable gap between the rich and the poor&quot;, which shows he sees the divide itself '
  . 'as the root of the violence rather than simple criminality.' . $BR
  . 'He also thinks the rioters have no hope of changing their situation, writing of their '
  . '&quot;utter hopelessness and disenfranchisement&quot;. This suggests he believes they feel shut out '
  . 'of society altogether.' . $BR
  . 'He is irritated by the politicians, who each returned from expensive foreign holidays, while he '
  . 'doubts the rioters have ever had &quot;a vacation&quot; at all. This contrast shows he feels the '
  . 'country&#39;s leaders are completely out of touch.' . $BR
  . 'At the same time he is not excusing the rioters, insisting that police '
  . '&quot;should arrest every last person who broke the law&quot;.' . $BR
  . 'Finally he blames a &quot;complete lack of social values&quot; and the parents, pointing out that '
  . 'there is not &quot;one report of goods being returned to their rightful owners&quot;.';

// Q4 (12) — 3 TTECEA paragraphs. Paragraphs 1-2 are solid; PARAGRAPH 3 IS DELIBERATELY THIN
// (assertion + quote, no close analysis, no reader effect) so per-paragraph marking shows a range.
$answers['Q4-response'] =
    'Adichie uses the structure of her own childhood writing to show how completely a single story '
  . 'can take over a young mind. She recalls that all her characters &quot;were white and blue-eyed, '
  . 'they played in the snow, they ate apples&quot;, even though she &quot;had never been outside '
  . 'Nigeria&quot;. The listing of these small, borrowed details piles up one imported image after '
  . 'another, and the rhythm of the list makes her imagination sound almost colonised by the books she '
  . 'had read. The effect on the reader is a kind of gentle shock, because these details are harmless '
  . 'on their own and yet together they prove that she had written herself out of her own stories. '
  . 'Adichie&#39;s purpose here is to show that a single story does not need to be cruel to do damage; '
  . 'it only needs to be the only one available.' . $BR
  . 'She then uses the anecdote of Fide to show how pity can flatten a whole family into one fact. '
  . 'Her mother&#39;s repeated instruction, &quot;Finish your food! Don&#39;t you know? People like '
  . 'Fide&#39;s family have nothing&quot;, turns the family into a lesson about waste rather than into '
  . 'people. The turning point comes with the &quot;beautifully patterned basket made of dyed raffia&quot;, '
  . 'where the adverb &quot;beautifully&quot; and the precise detail of the dyed raffia force the reader to '
  . 'see skill where they had been told to see only poverty. Adichie admits she was &quot;startled&quot;, '
  . 'and that single word makes her own shame the reader&#39;s shame too. Her purpose is to show that the '
  . 'single story is not something only other people fall for.' . $BR
  . 'At the end Adichie uses repetition to make her point. She writes that &quot;Stories matter. Many '
  . 'stories matter.&quot; This is effective and makes the reader think about the importance of stories.';

// Q5 (22) — intro + 3 comparative bodies + conclusion, 600+ words (clears the 550-word hard stop).
// ⚠️ BODY 2 IS DELIBERATELY ONE-SIDED: it analyses Text One only and tacks Text Two on in a final
// clause with no evidence. That is exactly what the new per-text criteria and the one-text rule
// are supposed to catch.
$answers['Q5-response'] =
    'Both Fletcher and Adichie are writing about what happens when a complicated group of people gets '
  . 'reduced to one simple story, but they approach it from opposite ends. Fletcher writes as a '
  . 'journalist standing outside the group he describes, using the hard evidence of money and '
  . 'geography to argue that London&#39;s poor have been written off; Adichie writes from inside the '
  . 'experience, using personal memory to show how the simplified story feels to the person it is told '
  . 'about. Across the two texts they agree that simplification has real consequences, but they differ '
  . 'in who they blame and in how much hope they leave the reader.' . $BR
  . 'Both writers begin by establishing distance between two groups, though they measure that distance '
  . 'very differently. Fletcher claims the rioters&#39; lives are so far from those of the country&#39;s '
  . 'leaders that &quot;it&#39;s like they occupy different planets&quot;, and the astronomical metaphor '
  . 'turns an economic gap into a physical impossibility, so that the reader feels the two groups could '
  . 'not reach one another even if they tried. Adichie measures the same distance in a single sentence '
  . 'of dialogue, when her American roommate asks &quot;where I had learned to speak English so well&quot;. '
  . 'Here the distance is not planetary but intimate, sitting between two young women sharing a room, '
  . 'and the politeness of the question is what makes it land so uncomfortably for the reader. Both '
  . 'writers therefore present the gap as something invisible to the powerful and obvious to the '
  . 'powerless, but Fletcher makes it vast while Adichie makes it close enough to touch, which is '
  . 'arguably more disturbing.' . $BR
  . 'Fletcher then uses statistics to prove that the poor have been abandoned. He reports that 106 Bond '
  . 'Street &quot;was sold for 28.5 million pounds&quot;, in &quot;Cash&quot;, and the one-word sentence '
  . 'stops the reader dead, making the sum feel casual to the buyer and obscene to everyone else. He '
  . 'follows it with the fact that an average earner &quot;would have to save his/her entire salary for '
  . '31 years&quot;, and the precision of the number makes the impossibility feel measured rather than '
  . 'emotional. He then writes that a jobless youth &quot;may as well live on Mars&quot;, returning to '
  . 'the planetary image and closing the argument. Adichie also thinks people are judged unfairly.' . $BR
  . 'Where the two writers finally separate is in what they think a story can do. Fletcher ends with an '
  . 'image rather than a solution, noting that &quot;the only shop left unlooted and untouched was the '
  . 'book shop&quot;, and the bleakness of that detail suggests he sees the divide as permanent, because '
  . 'the one thing that might change a life is the one thing nobody wanted. Adichie ends with the '
  . 'opposite claim, that &quot;stories can also be used to empower and to humanize&quot;, and the pairing '
  . 'of the two verbs offers the reader an active remedy rather than an observation. The difference '
  . 'matters because it changes what each text asks of us: Fletcher asks us to look, while Adichie asks '
  . 'us to listen differently.' . $BR
  . 'In the end both writers show that a single story is never harmless, because it decides in advance '
  . 'what a person is allowed to be. Fletcher proves it from the outside with money, and Adichie proves '
  . 'it from the inside with memory. Adichie is the more hopeful of the two, because she believes the '
  . 'story can be retold, and that is why her text leaves the reader with something to do rather than '
  . 'only something to regret.';

// Q6 (45) — task (a), the broadsheet article. Competent IUMVCC shape, but the counter-argument is
// thin, so the per-beat feedback has a clear target.
$answers['Q6-response'] =
    'The Story We Keep Telling' . $BR
  . 'There is a street in every city that the cameras only visit when something burns. The residents '
  . 'know the route the vans take. They know which corner will appear on the evening news, and they '
  . 'know that the photograph will be taken from the end of the road where the shutters are down. They '
  . 'have learned, over many years, what their neighbourhood is permitted to be on television.' . $BR
  . 'This matters now more than it used to. A community that is only ever filmed at its worst moment '
  . 'does not simply suffer an unfair reputation; it loses the argument about its own future before '
  . 'that argument begins. Councils fund what they believe exists. Employers hire from postcodes they '
  . 'believe in. When the only available story about a place is a story of disorder, the money and the '
  . 'opportunity quietly go elsewhere, and the disorder becomes easier to predict.' . $BR
  . 'The remedy is not complicated, and it does not require the press to look away from genuine trouble. '
  . 'It requires returning. A riot is covered by forty reporters in a single night; the youth centre '
  . 'that reopens eight months later is covered by nobody. If a paper sends someone back to the same '
  . 'street in the same year, without waiting for smoke, it will find the second story that was always '
  . 'there. That is not charity. It is simply finishing the job.' . $BR
  . 'Imagine a reader who has never visited that street forming their opinion from a newspaper that '
  . 'had done this properly. They would still know about the night the shops burned. They would also '
  . 'know who swept the glass, who reopened first, and who has been running the same football session '
  . 'every Saturday for a decade. The picture would be no less honest for being complete. It would '
  . 'simply be harder to dismiss.' . $BR
  . 'Some will say that newspapers report news, and that a quiet Tuesday is not news. That is true.' . $BR
  . 'But the choice is not between reporting the fire and ignoring it. It is between describing a '
  . 'place by its worst hour and describing it by its whole year. A newspaper that tells only one '
  . 'story about a community has not been neutral; it has made a decision about what those readers '
  . 'are allowed to imagine. The responsibility is not to be kind. It is to be complete, because the '
  . 'people in the photograph have to live in the place the photograph creates.';


// ── PLAN-BOX CONTENT (Phase 2 stages only: planning / outlining / polishing) ─────────────────
$plans = [
  // Q4 — three TTECEA paragraph plans (Adichie, language + structure)
  'plan-Q4-para-1' =>
      'Topic: childhood writing shows a single story taking over a young mind' . $BR
    . 'Technique + evidence: listing — "white and blue-eyed", "played in the snow", "ate apples"' . $BR
    . 'Close analysis: borrowed details pile up; imagination sounds colonised' . $BR
    . 'Effect: harmless details together prove she wrote herself out of her own stories' . $BR
    . 'Purpose: a single story need not be cruel, only the only one available',
  'plan-Q4-para-2' =>
      'Topic: the Fide anecdote — pity flattens a family into one fact' . $BR
    . 'Technique + evidence: repeated maternal instruction "People like Fide\'s family have nothing"' . $BR
    . 'Close analysis: turning point = "beautifully patterned basket made of dyed raffia"' . $BR
    . 'Effect: "startled" makes her shame the reader\'s shame' . $BR
    . 'Purpose: the single story is not something only other people fall for',
  'plan-Q4-para-3' =>
      'Topic: the ending turns the idea outward into a remedy' . $BR
    . 'Technique + evidence: repetition/anaphora — "Stories matter. Many stories matter."' . $BR
    . 'Close analysis: the second sentence corrects the first by adding one word' . $BR
    . 'Effect: reader is handed a task, not just an observation' . $BR
    . 'Purpose: stories can "repair that broken dignity"',
  // Q5 — comparative essay plan
  'plan-intro' =>
      'Both perspectives: Fletcher = outsider, journalist, money and geography; Adichie = insider, memory' . $BR
    . 'Comparative thesis: both show simplification has consequences, but they differ on blame and on hope',
  'plan-body-1' =>
      'Comparison point: both establish DISTANCE between two groups' . $BR
    . 'Text One: "occupy different planets" — astronomical metaphor, gap becomes physical impossibility' . $BR
    . 'Text Two: roommate asks "where I had learned to speak English so well" — distance is intimate' . $BR
    . 'As a pair: Fletcher makes it vast, Adichie makes it close enough to touch',
  'plan-body-2' =>
      'Comparison point: how each PROVES the simplification' . $BR
    . 'Text One: statistics — "28.5 million pounds", "Cash", "entire salary for 31 years"' . $BR
    . 'Text Two: NEED EVIDENCE HERE — Mexico/Guadalajara, "abject immigrant"' . $BR
    . 'As a pair: numbers vs confession — outside proof vs inside proof',
  'plan-body-3' =>
      'Comparison point: what each thinks a story can DO' . $BR
    . 'Text One: ends on "the only shop left unlooted and untouched was the book shop" — bleak, permanent' . $BR
    . 'Text Two: "stories can also be used to empower and to humanize" — active remedy' . $BR
    . 'As a pair: Fletcher asks us to look, Adichie asks us to listen differently',
  'plan-conclusion' =>
      'Restated thesis: a single story decides in advance what a person is allowed to be' . $BR
    . 'Fletcher proves it from outside with money; Adichie from inside with memory' . $BR
    . 'Adichie more hopeful — the story can be retold',
  // Q6 — IUMVCC plan for task (a), the broadsheet article
  'iumvcc-intro'      => 'Image: the street the cameras only visit when something burns; residents know the route the vans take',
  'iumvcc-urgency'    => 'A community filmed only at its worst loses the argument about its own future; councils fund what they believe exists',
  'iumvcc-method'     => 'The remedy is RETURNING — 40 reporters on riot night, nobody when the youth centre reopens. Send someone back without waiting for smoke',
  'iumvcc-vision'     => 'A reader who knows about the fire AND who swept the glass, who reopened first, the Saturday football session',
  'iumvcc-counter'    => 'Counter: "newspapers report news, a quiet Tuesday is not news" — concede, then answer (THIS IS THIN, needs developing)',
  'iumvcc-conclusion' => 'Not to be kind, to be complete — the people in the photograph have to live in the place the photograph creates',
];

$heals = [
 'explain what Fletcher means in lines 25-30 when he contrasts the Bond Street property sale with the earnings of an average worker.</p><p>[3 marks]</p><p>[3 marks]</p>'
   => 'explain what Fletcher means in lines 25-30 when he contrasts the Bond Street property sale with the earnings of an average worker.</p><p>[4 marks]</p><p>[4 marks]</p>',
 'Explain Fletcher\'s thoughts and feelings about the causes of the London riots. Use evidence from Text One to support your answer.</p><p>[6 marks]</p><p>[6 marks]</p>'
   => 'Explain Fletcher\'s thoughts and feelings about the causes of the London riots. Use evidence from Text One to support your answer.</p><p>[5 marks]</p><p>[5 marks]</p>',
 'Support your views with detailed reference to the text.</p><p>[12 marks]</p><p>[12 marks]</p><p>AO1, AO2</p>'
   => 'Support your views with detailed reference to the text.</p><p>[12 marks]</p><p>[12 marks]</p><p>AO2</p>',
 'Support your answer with detailed reference to both texts.</p><p>[22 marks]</p><p>[22 marks]</p><p>AO1, AO3</p>'
   => 'Support your answer with detailed reference to both texts.</p><p>[22 marks]</p><p>[22 marks]</p><p>AO3</p>',
];

// ── APPLY ACROSS EVERY STAGE ────────────────────────────────────────────────────────────────
$uid  = 1355;
$base = 'swml_canvas_edexcel-igcse_edexcel_igcse_lang_a_t1';
// Phase 1 = cold write (responses only). Phase 2 = responses + plan boxes.
$stages = [
  ''             => ['plans' => false, 'label' => 'diagnostic'],
  '_assessment'  => ['plans' => false, 'label' => 'assessment'],
  '_fbdiscuss'   => ['plans' => false, 'label' => 'fbdiscuss'],
  '_planning'    => ['plans' => true,  'label' => 'planning'],
  '_outlining'   => ['plans' => true,  'label' => 'outlining'],
  '_polishing'   => ['plans' => true,  'label' => 'polishing'],
];

foreach ($stages as $sfx => $cfg) {
    $key = $base . $sfx;
    $raw = get_user_meta($uid, $key, true);
    if (!$raw) { printf("%-13s SKIP (no doc)\n", $cfg['label']); continue; }
    $doc = json_decode($raw, true);
    if (!is_array($doc)) $doc = json_decode(wp_unslash($raw), true);
    if (!is_array($doc)) { printf("%-13s DECODE FAILED\n", $cfg['label']); continue; }
    $html = $doc['html'] ?? '';

    // heal stale tariffs/AOs baked before v7.20.617
    $healed = 0;
    foreach ($heals as $a => $b) { $n = substr_count($html,$a); if($n){$html=str_replace($a,$b,$html);$healed+=$n;} }
    // feedback card headers carry an em dash whose encoding varies — regex, not a literal
    $html = preg_replace_callback('/data-section-label="Feedback: Q([23]) \(([^)]*?) \/ (3|6)\)"/u',
        function ($m) use (&$healed) { $healed++; $new = ($m[1] === '2') ? '4' : '5';
            return 'data-section-label="Feedback: Q' . $m[1] . ' (' . $m[2] . ' / ' . $new . ')"'; }, $html);

    $set = $answers;
    if ($cfg['plans']) $set = $set + $plans;

    $wrote = 0; $skipped = 0;
    foreach ($set as $fid => $text) {
        $needle = 'data-field-id="' . $fid . '" data-input-field="true" class="swml-input-field">';
        $pos = strpos($html, $needle);
        if ($pos === false) { continue; }
        $insertAt = $pos + strlen($needle);
        $closeAt  = strpos($html, '</div>', $insertAt);
        if (trim(substr($html, $insertAt, $closeAt - $insertAt)) !== '') { $skipped++; continue; }
        $html = substr($html,0,$insertAt) . $text . substr($html,$closeAt);
        $wrote++;
    }

    $doc['html'] = $html;
    $plain = trim(preg_replace('/\s+/',' ', strip_tags(str_replace('<br>',' ',$html))));
    $doc['wordCount'] = str_word_count($plain);
    $doc['savedAt'] = gmdate('c');
    update_user_meta($uid, $key, wp_slash(wp_json_encode($doc)));

    // round-trip verify
    $back = get_user_meta($uid,$key,true);
    $rd = json_decode($back,true); if(!is_array($rd)) $rd=json_decode(wp_unslash($back),true);
    $ok = is_array($rd);
    $q5 = 0;
    if ($ok) {
        $n='data-field-id="Q5-response" data-input-field="true" class="swml-input-field">';
        $p=strpos($rd['html'],$n); $c=strpos($rd['html'],'</div>',$p+strlen($n));
        $q5=str_word_count(trim(strip_tags(str_replace('<br>',' ',substr($rd['html'],$p+strlen($n),$c-$p-strlen($n))))));
    }
    printf("%-13s wrote=%-3d skipped=%-3d healed=%-2d decode=%s words=%-5s Q5=%d words %s\n",
        $cfg['label'], $wrote, $skipped, $healed, $ok?'OK':'FAIL', $rd['wordCount']??'?', $q5,
        $q5 >= 550 ? '(clears 550 gate)' : ($q5? '(UNDER 550 GATE!)':''));
}
echo "\n_reassessment and _redraft intentionally left absent — they seed forward from _polishing on first open.\n";
