<?php
/**
 * rosabel-topic.php — install AQA Language Paper 1, June 2017 (The Tiredness of Rosabel)
 * as a topic on `swml_topics_aqa_language1`, for the LIVE MODELLING session.
 *
 * Source of truth (root CLAUDE.md — the board's own document, never our summary):
 *   insert : 8700_1-INS-EnglishLanguage-G-6Jun17-AM.pdf   (Source A, lines 1–45)
 *   paper  : 8700_1-QP-EnglishLanguage-G-6Jun17-AM.pdf    (Q1–Q5 wording + bullets + tariffs)
 * Both copied into "Sophicly Etch Mark Scheme Resources/AQA English Language Paper Mark Schemes".
 *
 * The line numbering below reproduces AQA's own: their printed markers fall at 1, 5, 6, 10, 14,
 * 15, 19, 20, 25, 30, 35, 40, 45 and every one of those lands on the same words here. That is
 * load-bearing, not cosmetic — Q2 says "lines 6 to 14" and Q4 says "from line 19 to the end",
 * so a one-line drift silently re-scopes two questions.
 *
 * Usage:  wp eval-file rosabel-topic.php          → DRY RUN, prints what it would write
 *         wp eval-file rosabel-topic.php apply    → writes
 *         wp eval-file rosabel-topic.php remove   → removes topic 11 again, leaving 1–10 untouched
 */

$mode = 'dry';
foreach ($args as $a) { if ($a === 'apply') $mode = 'apply'; if ($a === 'remove') $mode = 'remove'; }

// ⚠️ THE TEXT SLUG IS THE WHOLE BALLGAME (root CLAUDE.md §5d key-match trace). AQA Paper 1 has
// THREE divergent topic stores on the same site — `aqa_lang_paper_1` (what the live lesson
// shortcodes actually pass), `language1`, and `language_p1` — holding DIFFERENT topic sets.
// `SWML_Topic_Questions::option_key()` does not normalise, so the store a lesson reads is decided
// purely by its `text=` attribute. Writing to the wrong one is silent: the topic exists, and the
// lesson shows nothing. Default therefore matches the live shortcodes; override with text=<slug>.
$TEXT = 'aqa_lang_paper_1';
foreach ($args as $a) { if (strpos($a, 'text=') === 0) $TEXT = substr($a, 5); }
$KEY = 'swml_topics_aqa_' . sanitize_key($TEXT);
$TOPIC_NUMBER = 11;
echo "TEXT SLUG: {$TEXT}  →  option {$KEY}\n";

$extract = <<<'TXT'
**Title:** The Tiredness of Rosabel
**Author:** Katherine Mansfield (1908)
**Context:** 20th Century prose-fiction. An extract from a short story written in 1908. This extract is from the beginning of a short story by Katherine Mansfield. It is the early 1900s and Rosabel, a lower class girl who works in a hat shop, is on her way home.

1  At the corner of Oxford Circus, Rosabel bought a bunch of violets, and that was practically
2  the reason why she had so little tea – for a scone and a boiled egg and a cup of cocoa are
3  not sufficient after a hard day's work in a hat shop. As she swung onto the step of the bus,
4  grabbed her skirt with one hand and clung to the railing with the other, Rosabel thought she
5  would have sacrificed her soul for a good dinner, something hot and strong and filling.

6  Rosabel looked out of the windows; the street was blurred and misty, but light striking on
7  the panes turned their dullness to opal and silver, and the jewellers' shops seen through
8  this were fairy palaces. Her feet were horribly wet, and she knew the bottom of her skirt and
9  petticoat would be coated with black, greasy mud. There was a sickening smell of warm
10 humanity – it seemed to be oozing out of everybody in the bus – and everybody had the
11 same expression, sitting so still, staring in front of them. Rosabel stirred suddenly and
12 unfastened the two top buttons of her coat… she felt almost stifled. Through her
13 half-closed eyes, the whole row of people on the opposite seat seemed to resolve into one
14 meaningless, staring face.

15 She began to think of all that had happened during the day. Would she ever forget that
16 awful woman in the grey mackintosh, or the girl who had tried on every hat in the shop and
17 then said she would 'call in tomorrow and decide definitely'? Rosabel could not help
18 smiling; the excuse was worn so thin.

19 But there had been one other – a girl with beautiful red hair and a white skin and eyes the
20 colour of that green ribbon shot with gold they had got from Paris last week. Rosabel had
21 seen her carriage at the door; a man had come in with her, quite a young man, and so well
22 dressed.

23 'What is it exactly that I want, Harry?' she had said, as Rosabel took the pins out of her hat,
24 untied her veil, and gave her a hand-mirror.

25 'You must have a black hat,' he had answered, 'a black hat with a feather that goes right
26 round it and then round your neck and ties in a bow under your chin – and a decent-sized
27 feather.'

28 The girl glanced at Rosabel laughingly. 'Have you any hats like that?'

29 They had been very hard to please; Harry would demand the impossible, and Rosabel was
30 almost in despair. Then she remembered the big, untouched box upstairs.

31 'Oh, one moment, Madam,' she had said. 'I think perhaps I can show you something that
32 will please you better.' She had run up, breathlessly, cut the cords, scattered the tissue
33 paper, and yes, there was the very hat – rather large, soft, with a great, curled feather, and
34 a black velvet rose, nothing else. They had been charmed. The girl had put it on and then
35 handed it to Rosabel.

36 'Let me see how it looks on you,' she said.

37 Rosabel turned to the mirror and placed it on her brown hair, then faced them.

38 'Oh, Harry, isn't it adorable,' the girl cried, 'I must have that!' She smiled again at Rosabel.
39 'It suits you, beautifully.'

40 A sudden, ridiculous feeling of anger had seized Rosabel. She longed to throw the lovely,
41 perishable thing in the girl's face, and bent over the hat, flushing.

42 'It's exquisitely finished off inside, Madam,' she said. The girl swept out to her carriage, and
43 left Harry to pay and bring the box with him.

44 'I shall go straight home and put it on before I come out to lunch with you,' Rosabel heard
45 her say.
TXT;

$q1 = "Read again the first part of the source, from lines 1 to 5.\n\nList four things about Rosabel from this part of the source.";

$q2 = "Look in detail at this extract, from lines 6 to 14 of the source:\n\n"
    . "> Rosabel looked out of the windows; the street was blurred and misty, but light striking on the panes turned their dullness to opal and silver, and the jewellers' shops seen through this were fairy palaces. Her feet were horribly wet, and she knew the bottom of her skirt and petticoat would be coated with black, greasy mud. There was a sickening smell of warm humanity – it seemed to be oozing out of everybody in the bus – and everybody had the same expression, sitting so still, staring in front of them. Rosabel stirred suddenly and unfastened the two top buttons of her coat… she felt almost stifled. Through her half-closed eyes, the whole row of people on the opposite seat seemed to resolve into one meaningless, staring face.\n\n"
    . "How does the writer use language here to describe Rosabel's bus journey home?\n\nYou could include the writer's choice of:\n- words and phrases\n- language features and techniques\n- sentence forms.";

$q3 = "You now need to think about the whole of the source.\n\nThis text is from the beginning of a short story.\n\n"
    . "How has the writer structured the text to interest you as a reader?\n\nYou could write about:\n"
    . "- what the writer focuses your attention on at the beginning of the source\n"
    . "- how and why the writer changes this focus as the source develops\n"
    . "- any other structural features that interest you.";

$q4 = "Focus this part of your answer on the second part of the source, from line 19 to the end.\n\n"
    . "A student said, 'This part of the story, set in the hat shop, shows that the red-haired girl has many advantages in life, and I think Rosabel is right to be angry.'\n\n"
    . "To what extent do you agree?\n\nIn your response, you could:\n"
    . "- consider your own impressions of the red-haired girl\n"
    . "- evaluate how the writer conveys Rosabel's reactions to the red-haired girl\n"
    . "- support your response with references to the text.";

$q5 = "Your local newspaper is running a creative writing competition and they intend to publish the winning entries.\n\n"
    . "**Either:**\n\nDescribe a journey by bus as suggested by this picture: [IMAGE — the upper deck of an old London bus, passengers seated in rows, seen down the aisle].\n\n"
    . "**Or:**\n\nWrite a story about two people from very different backgrounds.\n\n"
    . "(24 marks for content and organisation)\n(16 marks for technical accuracy)\n[40 marks]";

$topic = [
    'topic_number'   => $TOPIC_NUMBER,
    'label'          => 'Practice Paper 11 — The Tiredness of Rosabel (Katherine Mansfield) · AQA June 2017',
    'topic_type'     => 'language_paper',
    'teaching_point' => 'AQA Language Paper 1 — Explorations in Creative Reading and Writing. One fiction source, five questions, 80 marks total. Section A tests reading (Q1-Q4), Section B tests writing (Q5). You have 1 hour 45 minutes.',
    'question_format'=> 'multi_question',
    'focus_poem' => '', 'focus_poet' => '', 'comparison_poem' => '', 'comparison_poet' => '',
    'question_text'  => $q1,
    'extract_text'   => $extract,
    'extract_location' => '',
    'marks'          => 4,
    'aos'            => 'AO1, AO2, AO4, AO5, AO6',
    'part_a_question' => '', 'part_a_extract' => '', 'part_a_extract_location' => '', 'part_a_marks' => '', 'part_a_aos' => '',
    'part_b_question' => '', 'part_b_extract' => '', 'part_b_marks' => '', 'part_b_aos' => '',
    'context' => '', 'instruction' => '', 'intro' => '',
    /* ⛔⛔ METADATA IS A JSON *STRING*, NEVER A PHP ARRAY, AND THE FAILURE IS SILENT.
       Every topic the importer writes stores it encoded (topics 1–5 on prod: string, ~7KB each),
       and the client does a JSON.parse on it. Hand it a decoded object and the parse yields no
       questions, `metadata.questions` is empty, and the builder falls straight through to the
       five-paragraph ESSAY template — with the extract still filled in, because the single-essay
       branch reads `extract_text` too. So it looks almost right, which is exactly why it cost an
       hour: correct paper, correct extract, wrong document, no error anywhere.
       This is the root CLAUDE.md §5b rule in its purest form — the data was PRESENT and
       WELL-FORMED as PHP, and still wrong, because it did not match the shape the reader expects. */
    'metadata' => wp_json_encode([
        'questions' => [
            ['id' => 'Q1', 'label' => 'Q1', 'text' => $q1, 'marks' => 4,  'aos' => 'AO1',        'extract' => '', 'bullets' => ''],
            ['id' => 'Q2', 'label' => 'Q2', 'text' => $q2, 'marks' => 8,  'aos' => 'AO2',        'extract' => '', 'bullets' => ''],
            ['id' => 'Q3', 'label' => 'Q3', 'text' => $q3, 'marks' => 8,  'aos' => 'AO2',        'extract' => '', 'bullets' => ''],
            ['id' => 'Q4', 'label' => 'Q4', 'text' => $q4, 'marks' => 20, 'aos' => 'AO4',        'extract' => '', 'bullets' => ''],
            ['id' => 'Q5', 'label' => 'Q5', 'text' => $q5, 'marks' => 40, 'aos' => 'AO5, AO6',   'extract' => '', 'bullets' => ''],
        ],
        'sources' => [
            ['label' => 'Source A', 'text' => $extract],
        ],
    ]),
    'task'       => 'planning',
    'updated_at' => current_time('mysql'),
];

$topics = get_option($KEY, []);
if (!is_array($topics)) $topics = [];
echo "BEFORE: " . count($topics) . " topics on {$KEY}\n";
foreach ($topics as $t) {
    echo sprintf("   #%-3s %s\n", $t['topic_number'] ?? '?', substr((string) ($t['label'] ?? ''), 0, 66));
}

$existing = null;
foreach ($topics as $i => $t) { if ((int) ($t['topic_number'] ?? 0) === $TOPIC_NUMBER) $existing = $i; }

if ($mode === 'remove') {
    if ($existing === null) { echo "\nTopic {$TOPIC_NUMBER} is not present — nothing to remove.\n"; return; }
    array_splice($topics, $existing, 1);
    update_option($KEY, $topics, false);
    wp_cache_delete($KEY, 'options'); wp_cache_delete('alloptions', 'options');
    echo "\nREMOVED topic {$TOPIC_NUMBER}. Now " . count(get_option($KEY, [])) . " topics.\n";
    return;
}

// Verification the paper itself demands: the two questions that name line numbers must still
// point at the words AQA scoped them to. A drift here is silent and re-scopes the question.
$lines = [];
foreach (explode("\n", $extract) as $ln) {
    if (preg_match('/^(\d+)\s(.*)$/', $ln, $m)) $lines[(int) $m[1]] = trim($m[2]);
}
$checks = [
    1  => 'At the corner of Oxford Circus',
    5  => 'would have sacrificed her soul',
    6  => 'Rosabel looked out of the windows',
    14 => 'meaningless, staring face.',
    19 => 'But there had been one other',
    45 => 'her say.',
];
$bad = 0;
echo "\nLINE-NUMBER CHECK (AQA's own markers must land on AQA's own words):\n";
foreach ($checks as $n => $needle) {
    $hit = isset($lines[$n]) && strpos($lines[$n], $needle) === 0;
    if (!$hit) $bad++;
    echo sprintf("   line %-3d %s  %s\n", $n, $hit ? 'OK  ' : 'WRONG', $needle);
}
echo "   lines parsed: " . count($lines) . " (expect 45)\n";
if (count($lines) !== 45) { $bad++; echo "   ⛔ line count is not 45\n"; }
if ($bad) { echo "\n⛔ REFUSING TO WRITE — {$bad} line check(s) failed.\n"; return; }

if ($mode !== 'apply') {
    echo "\nDRY RUN — would " . ($existing === null ? 'ADD' : 'REPLACE') . " topic {$TOPIC_NUMBER}:\n";
    $meta_preview = json_decode($topic['metadata'], true);
    echo "   label:    {$topic['label']}\n";
    echo "   metadata: " . gettype($topic['metadata']) . " — MUST be `string`, see the note above\n";
    echo "   questions: " . count($meta_preview['questions']) . " (";
    echo implode(', ', array_map(function ($q) { return $q['id'] . '=' . $q['marks']; }, $meta_preview['questions']));
    echo ") total " . array_sum(array_column($meta_preview['questions'], 'marks')) . " marks\n";
    echo "   extract:  " . strlen($extract) . " bytes, 45 numbered lines\n";
    echo "\nRe-run with `apply` to write, or `remove` to undo.\n";
    return;
}

if ($existing === null) $topics[] = $topic; else $topics[$existing] = $topic;
usort($topics, function ($a, $b) { return ($a['topic_number'] ?? 0) - ($b['topic_number'] ?? 0); });
$okw = update_option($KEY, $topics, false);
if (!$okw) { delete_option($KEY); $okw = add_option($KEY, $topics, '', 'no'); }
wp_cache_delete($KEY, 'options'); wp_cache_delete('alloptions', 'options');

$back = get_option($KEY, []);
$found = null;
foreach ($back as $t) { if ((int) ($t['topic_number'] ?? 0) === $TOPIC_NUMBER) $found = $t; }
echo "\nAFTER: " . count($back) . " topics. Topic {$TOPIC_NUMBER} " . ($found ? 'PRESENT' : 'MISSING') . "\n";
if ($found) {
    // The shape check that would have caught the hour this cost: metadata must come back a STRING
    // that decodes to 5 questions. A PHP array here means the client will silently build an essay.
    $fm = $found['metadata'] ?? null;
    $fq = is_string($fm) ? (json_decode($fm, true)['questions'] ?? []) : [];
    echo "   label:     {$found['label']}\n";
    echo "   metadata:  " . gettype($fm) . (is_string($fm) ? " ✓" : " ⛔ MUST BE A JSON STRING — the client will fall back to the essay template") . "\n";
    echo "   questions: " . count($fq) . (count($fq) === 5 ? " ✓" : " ⛔ expected 5") . "\n";
    echo "   extract:   " . strlen((string) $found['extract_text']) . " bytes\n";
    echo "   round-trip: " . (($found['extract_text'] === $extract) ? 'BYTE-IDENTICAL' : '⛔ DIFFERS — check wp_slash/encoding') . "\n";
}
