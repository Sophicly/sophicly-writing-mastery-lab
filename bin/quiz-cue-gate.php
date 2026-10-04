<?php
/**
 * quiz-cue-gate.php — can a student pass this quiz WITHOUT knowing the text? (FIXLIST #715/#719)
 *
 * Measured 2026-10-04: in every code-scored bank the correct option is usually the LONGEST one
 * (Foundational Quiz 83% of 1,289 MCQs, Mark Scheme Assessment 91% of 2,164) and True/False items
 * are keyed "True" 280 times in 286. "Pick the longest, answer True" scored 12/15 (Grade 7) on the
 * Edexcel IGCSE poetry bank with no knowledge of the poems. A runtime option shuffle hides letter
 * position; it cannot hide length, quotation marks or a key that is always "True".
 *
 * This gate reads every bank through THE real parser (SWML_Quiz_Bank::parse_file) — what the
 * student is actually served, never a regex re-reading of the markdown.
 *
 *   php bin/quiz-cue-gate.php                 report every bank (exit 0)
 *   php bin/quiz-cue-gate.php --bank=<file>   one bank, item by item (exit 1 if it fails)
 *   php bin/quiz-cue-gate.php --enforce       exit 1 if any bank listed in quiz-cue-gate.enforced.txt fails
 *
 * RATCHET: a bank joins quiz-cue-gate.enforced.txt the day it is rewritten, and from then on
 * pre-ship refuses any edit that brings a cue back. Banks not yet rewritten are reported, not failed.
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

// ── Thresholds (sources: research/QUIZ-DESIGN-RESEARCH-2026-10-04.md) ──────────────────────────
const KEY_LONGEST_MAX_SHARE = 0.35;   // bank: key strictly longest in at most this share of MCQs (chance = 1/options)
const ITEM_LENGTH_RATIO_MAX = 1.5;    // item: key length / mean distractor length above this = a length cue
const QUOTE_ONLY_MAX        = 0;      // bank: items where ONLY the key carries a quotation
const TF_TRUE_SHARE_MIN     = 0.35;   // bank: share of True/False keyed True (only checked at >= TF_MIN_ITEMS)
const TF_TRUE_SHARE_MAX     = 0.65;
const TF_MIN_ITEMS          = 4;

$args = array_slice($argv, 1);
$opt = ['bank' => null, 'enforce' => false];
foreach ($args as $a) {
    if ($a === '--enforce') $opt['enforce'] = true;
    elseif (strpos($a, '--bank=') === 0) $opt['bank'] = substr($a, 7);
}

function has_quote($s) { return (bool) preg_match('/["\x{201C}\x{201D}]/u', (string) $s); }
function mlen($s) { return function_exists('mb_strlen') ? mb_strlen((string) $s) : strlen((string) $s); }

/** Measure one bank. Returns [metrics, item-level problems]. */
function measure_bank($path) {
    $sections = SWML_Quiz_Bank::parse_file($path);
    $m = ['mcq' => 0, 'key_longest' => 0, 'length_cue' => 0, 'quote_only' => 0, 'tf' => 0, 'tf_true' => 0,
          'select_all' => 0, 'select_all_bad' => 0];
    $items = [];
    foreach ($sections as $sec => $qs) {
        foreach ($qs as $q) {
            $t = $q['type'];
            $ref = $sec . ' #' . $q['q_num'];
            if ($t === 'true_false') {
                $m['tf']++;
                if (stripos($q['answer'], 'true') === 0) $m['tf_true']++;
                continue;
            }
            if ($t === 'select_all') {
                $m['select_all']++;
                $n = count($q['options']); $c = count($q['correct']);
                if ($c >= $n || $c < 1) { $m['select_all_bad']++; $items[] = "$ref select-all: $c of $n options keyed correct (needs at least one wrong option)"; }
                $right = []; $wrong = [];
                foreach ($q['options'] as $L => $txt) { if (in_array($L, $q['correct'], true)) $right[] = $txt; else $wrong[] = $txt; }
                if ($right && $wrong) {
                    $rq = count(array_filter($right, 'has_quote')); $wq = count(array_filter($wrong, 'has_quote'));
                    if ($rq === count($right) && $wq === 0) { $m['quote_only']++; $items[] = "$ref select-all: every correct option quotes, no wrong one does"; }
                }
                continue;
            }
            if ($t !== 'mcq' || count($q['correct']) !== 1) continue;
            $key = $q['correct'][0];
            if (!isset($q['options'][$key])) continue;
            $m['mcq']++;
            $kl = mlen($q['options'][$key]);
            $dl = [];
            foreach ($q['options'] as $L => $txt) if ($L !== $key) $dl[] = mlen($txt);
            if (!$dl) continue;
            $mean = array_sum($dl) / count($dl);
            if ($kl > max($dl)) $m['key_longest']++;
            $ratio = $mean > 0 ? $kl / $mean : 0;
            if ($ratio > ITEM_LENGTH_RATIO_MAX) { $m['length_cue']++; $items[] = sprintf('%s length: key %d chars vs distractors avg %d (x%.1f)', $ref, $kl, $mean, $ratio); }
            $quoted = 0; foreach ($q['options'] as $L => $txt) if (has_quote($txt)) $quoted++;
            if ($quoted === 1 && has_quote($q['options'][$key])) { $m['quote_only']++; $items[] = "$ref quotation: only the key quotes the text"; }
        }
    }
    return [$m, $items];
}

/** The verdict for one bank: list of failed rules (empty = pass). */
function verdict($m) {
    $fail = [];
    if ($m['mcq'] > 0 && $m['key_longest'] / $m['mcq'] > KEY_LONGEST_MAX_SHARE)
        $fail[] = sprintf('key is the longest option in %d%% of MCQs (max %d%%)', round(100 * $m['key_longest'] / $m['mcq']), KEY_LONGEST_MAX_SHARE * 100);
    if ($m['length_cue'] > 0) $fail[] = $m['length_cue'] . ' MCQ(s) with the key over ' . ITEM_LENGTH_RATIO_MAX . 'x the distractors\' length';
    if ($m['quote_only'] > QUOTE_ONLY_MAX) $fail[] = $m['quote_only'] . ' item(s) where only the right answer quotes the text';
    if ($m['tf'] >= TF_MIN_ITEMS) {
        $s = $m['tf_true'] / $m['tf'];
        if ($s < TF_TRUE_SHARE_MIN || $s > TF_TRUE_SHARE_MAX) $fail[] = sprintf('True/False keyed True %d of %d', $m['tf_true'], $m['tf']);
    }
    if ($m['select_all_bad'] > 0) $fail[] = $m['select_all_bad'] . ' select-all item(s) with no wrong option';
    return $fail;
}

$enforced = [];
$ef = __DIR__ . '/quiz-cue-gate.enforced.txt';
if (file_exists($ef)) {
    foreach (preg_split('/\R/', (string) file_get_contents($ef)) as $ln) {
        $ln = trim(preg_replace('/#.*$/', '', $ln));
        if ($ln !== '') $enforced[$ln] = true;
    }
}

$banks = [];
foreach ($DIRS as $kind => $dir) {
    if (!is_dir($dir)) continue;
    foreach (glob($dir . '/*.md') as $p) {
        if (strpos(basename($p), '.concept-notes.') !== false) continue;
        $rel = $kind . '/' . basename($p);
        if ($opt['bank'] && basename($p) !== $opt['bank'] && $rel !== $opt['bank']) continue;
        $banks[$rel] = $p;
    }
}
if (!$banks) { fwrite(STDERR, "quiz-cue-gate: no bank matched\n"); exit(1); }

$fails = 0; $enforcedFails = 0; $tot = ['mcq' => 0, 'key_longest' => 0, 'tf' => 0, 'tf_true' => 0];
foreach ($banks as $rel => $p) {
    list($m, $items) = measure_bank($p);
    if ($m['mcq'] === 0 && $m['tf'] === 0 && $m['select_all'] === 0) continue;
    foreach ($tot as $k => $_) $tot[$k] += $m[$k];
    $v = verdict($m);
    $isEnf = isset($enforced[$rel]);
    if ($v) { $fails++; if ($isEnf) $enforcedFails++; }
    if ($opt['bank']) {
        echo ($v ? '✗ ' : '✓ ') . $rel . ($v ? ' — ' . implode('; ', $v) : '') . "\n";
        foreach ($items as $i) echo "   - $i\n";
    } elseif (!$opt['enforce'] || $isEnf) {
        printf("%s %-46s MCQ %4d  key-longest %3d%%  TF true %d/%d%s\n", $v ? '✗' : '✓', $rel, $m['mcq'],
            $m['mcq'] ? round(100 * $m['key_longest'] / $m['mcq']) : 0, $m['tf_true'], $m['tf'], $isEnf ? '  [enforced]' : '');
    }
}
if (!$opt['bank']) {
    printf("\nquiz-cue-gate: %d bank(s), %d failing; %d MCQs, key-longest %d%%; True/False keyed True %d/%d. Enforced: %d, failing %d.\n",
        count($banks), $fails, $tot['mcq'], $tot['mcq'] ? round(100 * $tot['key_longest'] / $tot['mcq']) : 0,
        $tot['tf_true'], $tot['tf'], count($enforced), $enforcedFails);
}
if ($opt['bank']) exit($fails ? 1 : 0);
if ($opt['enforce']) exit($enforcedFails ? 1 : 0);
exit(0);
