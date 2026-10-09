<?php
/**
 * quiz-cue-gate.php — can a student pass this quiz WITHOUT knowing the text? (FIXLIST #715/#719)
 *
 * Measured 2026-10-04: in every code-scored bank the correct option is usually the LONGEST one
 * (85% of 4,321 MCQs across FQ, MSQ and MSA) and True/False items are keyed "True" 502 times in 552.
 * A script that never reads a text scores 81% on the Foundational Quiz banks. A runtime option
 * shuffle hides letter position; it cannot hide length, quotation marks or a key that is always True.
 *
 * The rules are the automatable lines of the item checklist in
 * research/QUIZ-DESIGN-RESEARCH-2026-10-04.md §3 (line numbers cited per check below).
 * Every bank is read through THE real parser (SWML_Quiz_Bank::parse_file) and the blind script is
 * marked by THE real scorer (SWML_Quiz_Bank::score) — what the student is served and how they are
 * marked, never a regex re-reading of the markdown.
 *
 *   php bin/quiz-cue-gate.php                 report every bank (exit 0)
 *   php bin/quiz-cue-gate.php --bank=<file>   one bank, item by item (exit 1 if it fails)
 *   php bin/quiz-cue-gate.php --enforce       exit 1 if any bank listed in quiz-cue-gate.enforced.txt fails
 *
 * RATCHET: a bank joins quiz-cue-gate.enforced.txt the day it is rewritten; from then on pre-ship
 * refuses any edit that brings a cue back. Banks not yet rewritten are reported, never failed.
 */

define('ABSPATH', __DIR__ . '/');
function plugin_dir_path($f) { return rtrim($f, '/') . '/'; }
function sanitize_key($k) { return strtolower(preg_replace('/[^a-z0-9_\-]/i', '', (string) $k)); }
function sanitize_file_name($f) { return preg_replace('/[^A-Za-z0-9._\-]/', '', (string) $f); }
require __DIR__ . '/../includes/class-quiz-bank.php';

$ROOT = dirname(__DIR__);
$DIRS = [
    'FQ'  => $ROOT . '/protocols/shared/foundational-quiz/banks',
    'MSQ' => $ROOT . '/protocols/shared/mark-scheme-quiz',
    'MSA' => $ROOT . '/protocols/shared/mark-scheme-assessment/banks',
];

// ── Thresholds — research §3 line numbers in brackets ─────────────────────────────────────────
const KEY_LONGEST_MAX_SHARE = 0.34;  // [1] bank: the longest option is the key in at most ~1 item in 3
const ITEM_LENGTH_TOLERANCE = 0.20;  // [1] item: key within ±20% of the mean wrong-option length…
const SHORT_OPTION_CHARS    = 30;    //     …for options longer than this. Bare titles/names (a poem's title
                                     //     is a fixed length) are held to the bank-level share only — a
                                     //     disclosed adaptation, not in the research.
const FEATURE_GAP_MAX       = 0.10;  // [2] bank: quote / dash / absolute-word rate in keys vs wrong options
                                     //     may differ by at most 10 points (research says "as often"; the
                                     //     10-point tolerance is ours).
const TF_FALSE_MIN          = 0.40;  // [5] bank: 40–60% of True/False keyed False…
const TF_FALSE_MAX          = 0.60;
const TF_MIN_ITEMS          = 4;     //     …checked once a bank has this many; 2–3 items need one of each
const VERSIONS_MIN          = 3;     // [7] FQ: at least three versions per @dim aspect (a round draws one)
const BLIND_MAX             = 0.40;  // [11] the blind script ("longest / True / longer options") must score
                                     //     close to guessing (about a third) — 40% ceiling
const ABSURD = '/\b(no effect|at random|for no reason|nothing to do with)\b/i';                 // [3]
const ABSOLUTE = '/\b(always|never|only|wholly|entirely|completely|totally|purely|solely|nothing|no one|none)\b/i';

$opt = ['bank' => null, 'enforce' => false];
foreach (array_slice($argv, 1) as $a) {
    if ($a === '--enforce') $opt['enforce'] = true;
    elseif (strpos($a, '--bank=') === 0) $opt['bank'] = substr($a, 7);
}

function mlen($s) { return function_exists('mb_strlen') ? mb_strlen((string) $s) : strlen((string) $s); }
function feats($s) {
    $s = (string) $s;
    return [
        'quote'    => (bool) preg_match('/["\x{201C}\x{201D}]/u', $s),
        'dash'     => (bool) preg_match('/\x{2014}|\x{2013}|\s-\s/u', $s),
        'absolute' => (bool) preg_match(ABSOLUTE, $s),
    ];
}

/** The blind script's answer for one question — it never reads the text. [11] */
function blind_answer($q) {
    if ($q['type'] === 'true_false') return 'True';
    if (!$q['options']) return '';
    $lens = array_map('mlen', $q['options']);
    if ($q['type'] === 'mcq') { arsort($lens); return (string) key($lens); }
    if ($q['type'] === 'select_all') {
        $mean = array_sum($lens) / count($lens);
        $pick = array_keys(array_filter($lens, function ($l) use ($mean) { return $l > $mean; }));
        if (!$pick) { arsort($lens); $pick = [key($lens)]; }
        return implode(', ', $pick);
    }
    return '';
}

/** Measure one bank — or, with $board, only that board's section ("AQA (8700 — Paper 1)" for 'aqa'; v7.20.782,
 *  #815d: a multi-board bank joins the ratchet one section at a time, as each board's items are rewritten). */
function measure_bank($path, $kind, $board = null) {
    $sections = SWML_Quiz_Bank::parse_file($path);
    if ($board !== null && $board !== '') {
        $want = strtoupper($board) . ' (';
        $sections = array_filter($sections, function ($k) use ($want) { return strpos((string) $k, $want) === 0; }, ARRAY_FILTER_USE_KEY);
    }
    $m = ['mcq' => 0, 'key_longest' => 0, 'length_cue' => 0, 'tf' => 0, 'tf_false' => 0,
          'sa' => 0, 'sa_counts' => [], 'blind' => 0.0, 'blind_max' => 0.0, 'absurd' => 0, 'no_why' => 0,
          'feat' => ['key' => ['n' => 0, 'quote' => 0, 'dash' => 0, 'absolute' => 0],
                     'wrong' => ['n' => 0, 'quote' => 0, 'dash' => 0, 'absolute' => 0]],
          'dims' => [], 'undimmed' => 0];
    $items = [];
    foreach ($sections as $sec => $qs) {
        foreach ($qs as $q) {
            $t = $q['type'];
            $ref = '#' . $q['q_num'];
            if (in_array($t, ['mcq', 'true_false', 'select_all'], true)) {
                $s = SWML_Quiz_Bank::score($q, blind_answer($q));
                $m['blind'] += (float) $s['marks']; $m['blind_max'] += (float) $s['max'];
                if ($kind === 'FQ') {
                    if (($q['dim'] ?? '') !== '') $m['dims'][$q['dim'] . '|' . ($q['text'] ?? '')] = ($m['dims'][$q['dim'] . '|' . ($q['text'] ?? '')] ?? 0) + 1;
                    else $m['undimmed']++;
                }
            }
            if ($t === 'true_false') {
                $m['tf']++;
                if (stripos($q['answer'], 'false') === 0) $m['tf_false']++;
                continue;
            }
            if ($t !== 'mcq' && $t !== 'select_all') continue;
            $keyset = $q['correct'];
            foreach ($q['options'] as $L => $txt) {
                $side = in_array($L, $keyset, true) ? 'key' : 'wrong';
                $m['feat'][$side]['n']++;
                foreach (feats($txt) as $f => $on) if ($on) $m['feat'][$side][$f]++;
                if ($side === 'wrong') {
                    if (preg_match(ABSURD, $txt)) { $m['absurd']++; $items[] = "$ref [3] wrong option $L is not a real competitor: \"" . mb_substr($txt, 0, 60) . '…"'; }
                    if (!isset($q['why'][$L]) || $q['why'][$L] === '') { $m['no_why']++; $items[] = "$ref [3] wrong option $L has no Why note"; }
                }
            }
            if ($t === 'select_all') {
                $m['sa']++;
                $n = count($q['options']); $c = count($keyset);
                $m['sa_counts'][$c] = true;
                if ($c < 1 || $c >= $n) $items[] = "$ref [6] select-all: $c of $n options keyed correct (needs at least one right and one wrong)";
                continue;
            }
            if (count($keyset) !== 1 || !isset($q['options'][$keyset[0]])) continue;
            $m['mcq']++;
            $key = $keyset[0];
            $kl = mlen($q['options'][$key]);
            $dl = [];
            foreach ($q['options'] as $L => $txt) if ($L !== $key) $dl[] = mlen($txt);
            if (!$dl) continue;
            $mean = array_sum($dl) / count($dl);
            if ($kl > max($dl)) $m['key_longest']++;
            if ($kl > SHORT_OPTION_CHARS && $mean > 0 && abs($kl / $mean - 1) > ITEM_LENGTH_TOLERANCE) {
                $m['length_cue']++;
                $items[] = sprintf('%s [1] length: key %d chars, wrong options average %d (%+d%%)', $ref, $kl, $mean, round(100 * ($kl / $mean - 1)));
            }
        }
    }
    return [$m, $items];
}

/** The verdict for one bank: list of failed rules (empty = pass). */
function verdict($m, $kind) {
    $fail = [];
    if ($m['mcq'] > 0 && $m['key_longest'] / $m['mcq'] > KEY_LONGEST_MAX_SHARE)
        $fail[] = sprintf('[1] key is the longest option in %d%% of MCQs (max %d%%)', round(100 * $m['key_longest'] / $m['mcq']), round(KEY_LONGEST_MAX_SHARE * 100));
    if ($m['length_cue'] > 0) $fail[] = '[1] ' . $m['length_cue'] . ' MCQ(s) with the key more than 20% longer or shorter than the wrong options';
    $k = $m['feat']['key']; $w = $m['feat']['wrong'];
    if ($k['n'] && $w['n']) {
        foreach (['quote' => 'quotation marks', 'dash' => 'dashes', 'absolute' => 'absolute words'] as $f => $label) {
            $gap = $k[$f] / $k['n'] - $w[$f] / $w['n'];
            if (abs($gap) > FEATURE_GAP_MAX)
                $fail[] = sprintf('[2] %s in %d%% of right options vs %d%% of wrong ones', $label, round(100 * $k[$f] / $k['n']), round(100 * $w[$f] / $w['n']));
        }
    }
    if ($m['absurd'] > 0) $fail[] = '[3] ' . $m['absurd'] . ' wrong option(s) that are not real competitors ("no effect", "at random"…)';
    if ($m['no_why'] > 0) $fail[] = '[3] ' . $m['no_why'] . ' wrong option(s) with no Why note';
    if ($m['tf'] >= TF_MIN_ITEMS) {
        $s = $m['tf_false'] / $m['tf'];
        if ($s < TF_FALSE_MIN || $s > TF_FALSE_MAX) $fail[] = sprintf('[5] True/False keyed False %d of %d (needs 40-60%%)', $m['tf_false'], $m['tf']);
    } elseif ($m['tf'] >= 2 && ($m['tf_false'] === 0 || $m['tf_false'] === $m['tf'])) {
        $fail[] = sprintf('[5] all %d True/False items share one answer', $m['tf']);
    }
    if ($m['sa'] >= 3 && count($m['sa_counts']) < 2) $fail[] = '[6] every select-all item has the same number of right answers (' . implode('', array_keys($m['sa_counts'])) . ')';
    if ($kind === 'FQ') {
        if ($m['undimmed'] > 0) $fail[] = '[7] ' . $m['undimmed'] . ' item(s) carry no @dim aspect, so every round repeats them';
        $thin = array_filter($m['dims'], function ($n) { return $n < VERSIONS_MIN; });
        if ($thin) $fail[] = '[7] ' . count($thin) . ' aspect(s) with fewer than ' . VERSIONS_MIN . ' versions';
    }
    if ($m['blind_max'] > 0 && $m['blind'] / $m['blind_max'] > BLIND_MAX)
        $fail[] = sprintf('[11] the blind script scores %d%% without reading the text (max %d%%)', round(100 * $m['blind'] / $m['blind_max']), BLIND_MAX * 100);
    return $fail;
}

// ── --selftest: a clean bank must PASS, and each injected cue must FAIL its own rule. A gate that
// fails every real bank proves nothing until it is shown passing a good one (falsify, root §14b).
if (in_array('--selftest', $argv, true)) {
    $mcq = function ($n, $dim, $key, $opts, $why = true) {
        $o = []; foreach ($opts as $L => $t) $o[] = "$L) $t";
        $s = "$n. **Type: MCQ [Tests Meaning]**\n   @dim:$dim\n   * **Question:** Which reading of stanza $n holds up best?\n"
           . '   * **Options:** ' . implode(', ', $o) . "\n   * **Correct:** $key\n   * **Feedback:** Explained.\n";
        if ($why) foreach ($opts as $L => $t) if ($L !== $key) $s .= "   * **Why $L:** A misreading of the turn.\n";
        return $s;
    };
    $tf = function ($n, $dim, $ans) { return "$n. **Type: True-False [Tests Form]**\n   @dim:$dim\n   * **Question:** Statement $n about the form.\n   * **Answer:** $ans\n   * **Feedback:** Explained.\n   * **WhyWrong:** The confusion.\n"; };
    $sa = function ($n, $dim, $keys) {
        $s = "$n. **Type: Select All [Tests Form]**\n   @dim:$dim\n   * **Question:** Which features shape stanza $n?\n"
           . "   * **Options:** A) A refrain that returns each verse, B) A volta that turns the argument, C) A caesura that breaks the line, D) An enjambed line that spills over\n"
           . "   * **Correct:** $keys\n   * **Feedback:** Explained.\n";
        foreach (['A', 'B', 'C', 'D'] as $L) if (strpos($keys, $L) === false) $s .= "   * **Why $L:** Not in this stanza.\n";
        return $s;
    };
    // Every MCQ: key ~50 chars, the LONGEST option is always a wrong one, all within ±20%.
    $opts = function ($k) {
        $base = ['A' => 'The speaker turns from anger toward grief here', 'B' => 'The speaker hides the grief behind a calm surface',
                 'C' => 'The speaker blames the town for the loss of the boy', 'D' => 'The speaker forgives the town for what it failed to do'];
        return $base;   // key letter chosen by caller; D (longest) is never the key below
    };
    $build = function ($mut) use ($mcq, $tf, $sa, $opts) {
        $b = "# Fixture\n\n### Quiz: Fixture\n\n"; $n = 0;
        foreach (['speaker', 'form', 'meaning'] as $d) {
            foreach (['A', 'B', 'C'] as $k) { $o = $opts($k); if ($mut === 'long') $o[$k] .= ' and also a great deal more detail that makes it obviously the right one'; if ($mut === 'quote' ) $o[$k] = '"' . $o[$k] . '"'; if ($mut === 'absurd' && $k === 'A') $o['B'] = 'The poem has no effect on how we read the danger'; $b .= $mcq(++$n, $d, $k, $o) . "\n"; }
        }
        foreach (['True', 'False', 'True', 'False'] as $i => $a) $b .= $tf(++$n, 'form', $mut === 'alltrue' ? 'True' : $a) . "\n";
        foreach (['A', 'A, C', 'B'] as $keys) $b .= $sa(++$n, 'speaker', $mut === 'samecount' ? 'A, C' : $keys) . "\n";
        if ($mut === 'nodim') $b = preg_replace('/^\s*@dim:\S+\n/m', '', $b);
        return $b;
    };
    $cases = ['clean' => null, 'long' => '[1]', 'long ' => '[11]', 'quote' => '[2]', 'absurd' => '[3]', 'alltrue' => '[5]', 'samecount' => '[6]', 'nodim' => '[7]'];
    $bad = 0;
    foreach ($cases as $mut => $expect) {
        $f = tempnam(sys_get_temp_dir(), 'qcg') . '.md';
        file_put_contents($f, $build($mut === 'clean' ? '' : trim($mut)));
        list($m) = measure_bank($f, 'FQ'); @unlink($f);
        $v = verdict($m, 'FQ');
        $hit = $expect === null ? !$v : (bool) array_filter($v, function ($x) use ($expect) { return strpos($x, $expect) === 0; });
        echo ($hit ? '  ✓ ' : '  ✗ ') . str_pad($mut, 10) . ($expect === null ? 'passes' : "fails $expect") . ($hit ? '' : '  — got: ' . ($v ? implode('; ', $v) : 'PASS')) . "\n";
        if (!$hit) $bad++;
    }
    // v7.20.782: section scope — a clean section passes while a dirty section in the SAME file fails, and only its own.
    $two = str_replace('### Quiz: Fixture', '### **SECTION A: CLEAN (fixture)**', $build(''))
         . "\n" . str_replace('### Quiz: Fixture', '### **SECTION B: DIRTY (fixture)**', preg_replace('/^# Fixture\n/', '', $build('long')));
    $f = tempnam(sys_get_temp_dir(), 'qcg') . '.md'; file_put_contents($f, $two);
    list($mc) = measure_bank($f, 'FQ', 'clean'); list($md) = measure_bank($f, 'FQ', 'dirty'); list($mn) = measure_bank($f, 'FQ', 'absent'); @unlink($f);
    $okTwo = !verdict($mc, 'FQ') && (bool) verdict($md, 'FQ') && $mn['mcq'] === 0 && $mc['mcq'] === 9 && $md['mcq'] === 9;
    echo ($okTwo ? '  ✓ ' : '  ✗ ') . "section   a clean section passes, a dirty one in the same file fails, an absent board measures nothing\n";
    if (!$okTwo) $bad++;
    echo $bad ? "quiz-cue-gate selftest FAILED ($bad)\n" : "quiz-cue-gate selftest passed (" . (count($cases) + 1) . " cases)\n";
    exit($bad ? 1 : 0);
}

// v7.20.783 (WML 339 A): a note that names an option by its LETTER is only true if the options keep their authored order.
// Drives the REAL SWML_Quiz_Bank::shuffle_options over every bank: any item whose notes cite a letter but which would
// still be shuffled fails the build (universal, not ratcheted — the guard makes it zero by construction).
function letter_cite_shuffled($banksDirs) {
    $m = new ReflectionMethod('SWML_Quiz_Bank', 'shuffle_options');
    if (PHP_VERSION_ID < 80100) $m->setAccessible(true);
    $bad = [];
    foreach ($banksDirs as $kind => $dir) foreach (glob($dir . '/*.md') as $p) {
        if (strpos(basename($p), '.concept-notes.') !== false) continue;
        foreach (SWML_Quiz_Bank::parse_file($p) as $qs) foreach ($qs as $q) {
            if (!in_array($q['type'], ['mcq', 'select_all', 'ranking'], true) || count((array) $q['options']) < 2) continue;
            $cite = $q['feedback'] . ' ' . implode(' ', (array) ($q['why'] ?? [])) . ' ' . ($q['why_generic'] ?? '');
            if (!preg_match('/\([A-E]\)|(?<![A-Za-z\x{2019}\'])[A-E](?=\s*[\)=,]|\s+(?:\(|is\b|then\b))/u', $cite)) continue;
            $moved = false;
            for ($i = 0; $i < 8 && !$moved; $i++) { $r = $m->invoke(null, $q); if (array_values($r['options']) !== array_values($q['options'])) $moved = true; }
            if ($moved) $bad[] = $kind . '/' . basename($p) . ' #' . $q['q_num'];
        }
    }
    return $bad;
}
if (in_array('--letter-cites', $argv, true) || $opt['enforce']) {
    $lc = letter_cite_shuffled($DIRS);
    if ($lc) { echo '✗ ' . count($lc) . " item(s) whose notes name an option by letter are still shuffled when served: " . implode(', ', array_slice($lc, 0, 12)) . "\n"; if ($opt['enforce']) { echo "quiz-cue-gate: letter-cite check FAILED\n"; exit(1); } }
    else echo "✓ no shuffled item's notes name an option by its letter\n";
    if (!$opt['enforce']) exit($lc ? 1 : 0);
}

$enforced = [];
$ef = __DIR__ . '/quiz-cue-gate.enforced.txt';
if (file_exists($ef)) {
    foreach (preg_split('/\R/', (string) file_get_contents($ef)) as $ln) {
        // A comment starts at the line start or after whitespace — "MSA/language1.md#aqa" is a section, not a comment.
        $ln = trim(preg_replace('/(^|\s)#.*$/', '', $ln));
        if ($ln !== '') $enforced[$ln] = true;
    }
}

$banks = [];
// v7.20.782 (#815d): "--bank=language1.md#aqa" / ratchet line "MSA/language1.md#aqa" = one board's section only.
$optBoard = null;
if ($opt['bank'] && strpos($opt['bank'], '#') !== false) list($opt['bank'], $optBoard) = explode('#', $opt['bank'], 2);
foreach ($DIRS as $kind => $dir) {
    if (!is_dir($dir)) continue;
    foreach (glob($dir . '/*.md') as $p) {
        if (strpos(basename($p), '.concept-notes.') !== false) continue;
        $rel = $kind . '/' . basename($p);
        if ($opt['bank'] && basename($p) !== $opt['bank'] && $rel !== $opt['bank']) continue;
        if ($optBoard !== null) { $banks[$rel . '#' . $optBoard] = [$p, $kind, $optBoard]; continue; }
        $banks[$rel] = [$p, $kind, null];
        foreach (array_keys($enforced) as $e) {
            if (strpos($e, $rel . '#') === 0) $banks[$e] = [$p, $kind, substr($e, strlen($rel) + 1)];
        }
    }
}
if (!$banks) { fwrite(STDERR, "quiz-cue-gate: no bank matched\n"); exit(1); }

$fails = 0; $enforcedFails = 0; $byKind = [];
foreach ($banks as $rel => list($p, $kind, $board)) {
    list($m, $items) = measure_bank($p, $kind, $board);
    if ($m['mcq'] === 0 && $m['tf'] === 0 && $m['sa'] === 0) {
        if ($board !== null) { $fails++; if (isset($enforced[$rel])) $enforcedFails++; echo "✗ $rel — no section labelled \"" . strtoupper($board) . " (…\" in this bank\n"; }
        continue;
    }
    $b = &$byKind[$kind];
    foreach (['mcq', 'key_longest', 'tf', 'tf_false', 'blind', 'blind_max'] as $f) $b[$f] = ($b[$f] ?? 0) + $m[$f];
    $b['banks'] = ($b['banks'] ?? 0) + 1;
    unset($b);
    $v = verdict($m, $kind);
    $isEnf = isset($enforced[$rel]);
    if ($v) { $fails++; if ($isEnf) $enforcedFails++; }
    $blindPct = $m['blind_max'] ? round(100 * $m['blind'] / $m['blind_max']) : 0;
    if ($opt['bank']) {
        echo ($v ? '✗ ' : '✓ ') . $rel . " — blind script $blindPct%\n";
        foreach ($v as $f) echo "   ✗ $f\n";
        foreach ($items as $i) echo "     - $i\n";
    } elseif (!$opt['enforce'] || $isEnf) {
        printf("%s %-44s MCQ %4d  key-longest %3d%%  TF false %3d/%-3d  blind %3d%%%s\n", $v ? '✗' : '✓', $rel, $m['mcq'],
            $m['mcq'] ? round(100 * $m['key_longest'] / $m['mcq']) : 0, $m['tf_false'], $m['tf'], $blindPct, $isEnf ? '  [enforced]' : '');
    }
}
if (!$opt['bank']) {
    echo "\n";
    foreach ($byKind as $kind => $b) {
        printf("  %-3s %3d banks · %4d MCQs, key longest %d%% · True/False keyed False %d of %d · blind script %d%%\n", $kind, $b['banks'], $b['mcq'],
            $b['mcq'] ? round(100 * $b['key_longest'] / $b['mcq']) : 0, $b['tf_false'], $b['tf'], $b['blind_max'] ? round(100 * $b['blind'] / $b['blind_max']) : 0);
    }
    printf("quiz-cue-gate: %d bank(s), %d failing. Enforced: %d, failing %d.\n", count($banks), $fails, count($enforced), $enforcedFails);
}
if ($opt['bank']) exit($fails ? 1 : 0);
if ($opt['enforce']) exit($enforcedFails ? 1 : 0);
exit(0);
