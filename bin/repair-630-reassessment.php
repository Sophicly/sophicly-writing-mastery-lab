<?php
/**
 * FIXLIST #630 one-off repair — a Phase-2 REASSESSMENT doc that inherited Phase-1 marks.
 * Usage (staging test student):  RU=1938 wp eval "require \"/tmp/repair-630-reassessment.php\";"
 * Usage (PRODUCTION student, only on Neil's go):  RU=857 RLIVE=1 RTRIM=118 RPHASE=1 wp eval "require \"/tmp/repair-630-reassessment.php\";"
 * Dry run (reads, prints what WOULD change, writes nothing):  add RDRY=1
 * What it does (all backed up first in user meta swml_bak_20260928_630_reassess_repair):
 *   1. runs SWML_REST_API::reset_marking_output() on the reassessment doc (Feedback boxes, calib rows,
 *      Overall Feedback, and since v7.20.650 the Action Plan / Analytics rows + baked Score Summary dates)
 *   2. v7.20.650: removes a docCompletedAt stamped by the carried marks (measured: Qamar's reassessment
 *      carried docCompletedAt == startedAt, 27 Sep — the heal would re-bake that date on every load)
 *   3. RTRIM=N: trims the chat to its first N turns (Qamar: 118 drops the 3 junk "marks filed" +
 *      SYSTEM pairs). Omitted = the chat is left alone — never a hard-coded count for someone else.
 *   4. RPHASE=1: deletes the swml_phase_…_t1_redraft record written by the carried-marks auto-commit.
 *      Omitted = kept — a genuine redraft record (e.g. a June mark) is never deleted by default.
 * Keys are AQA Lang P1 Topic 1. Adjust before reusing for another paper or topic.
 */
$u = (int) getenv('RU'); $live = getenv('RLIVE') === '1'; $dry = getenv('RDRY') === '1';
$trim = getenv('RTRIM') !== false && getenv('RTRIM') !== '' ? (int) getenv('RTRIM') : null;
$delPhase = getenv('RPHASE') === '1';
if (!$live && strpos(get_userdata($u)->user_email, 'neilson248+') !== 0) die("refuse\n");
$ck = 'swml_canvas_aqa_aqa_lang_paper_1_t1_reassessment'; $hk = 'swml_chat_aqa_aqa_lang_paper_1_t1_reassessment'; $pk = 'swml_phase_aqa_aqa_lang_paper_1_t1_redraft';
// v7.20.661: the marking LEDGER too. load_canvas heal_feedback_labels_from_ledger() backfills every
// "—" box from questions_scored on load, so a doc reset alone is undone the moment the page opens
// (measured staging 2026-09-29: reset doc served back with the previous run's marks → false commit).
$ledger = SWML_Session_Manager::get_assessment_state($u, 'aqa', 'aqa_lang_paper_1', 1, '_reassessment', 1);
$bak = ['canvas' => get_user_meta($u, $ck, true), 'chat' => get_user_meta($u, $hk, true), 'phase' => get_user_meta($u, $pk, true), 'ledger' => $ledger];
$d = json_decode($bak['canvas'], true); if (!is_array($d)) $d = json_decode(wp_unslash($bak['canvas']), true);
if (!is_array($d) || empty($d['html'])) die("user $u: no reassessment doc — nothing to do\n");
$before = substr_count($d['html'], 'data-section-type='); $d['html'] = SWML_REST_API::reset_marking_output($d['html']); $after = substr_count($d['html'], 'data-section-type=');
preg_match_all('/data-section-label="(Feedback: Q[^"]*)"/', $d['html'], $fm);
$hadCompleted = isset($d['docCompletedAt']) ? $d['docCompletedAt'] : '';
unset($d['docCompletedAt']);
$c = json_decode($bak['chat'], true); if (!is_array($c)) $c = json_decode(wp_unslash($bak['chat']), true);
$hist = (is_array($c) && isset($c['history']) && is_array($c['history'])) ? $c['history'] : [];
$n0 = count($hist); $keep = ($trim === null) ? $hist : array_slice($hist, 0, $trim);
echo ($dry ? '[DRY RUN — nothing written] ' : '') . "user $u: sections {$before}→{$after}; boxes: " . implode(' | ', $fm[1])
    . "; docCompletedAt " . ($hadCompleted ? "'$hadCompleted' removed" : 'absent') . "; chat {$n0}→" . count($keep)
    . ($trim !== null && $keep ? ' (last kept: ' . substr((string) ($keep[count($keep) - 1]['content'] ?? ''), 0, 40) . ')' : '')
    . "; phase record " . ($delPhase ? ($bak['phase'] ? 'DELETED (was ' . substr((string) $bak['phase'], 0, 60) . ')' : 'absent') : 'kept')
    . "; ledger questions_scored " . (empty($ledger['questions_scored']) ? 'empty' : 'CLEARED (' . implode(',', array_keys((array) $ledger['questions_scored'])) . ')') . "\n";
if ($dry) return;
$bk = 'swml_bak_20260928_630_reassess_repair';
if (get_user_meta($u, $bk, true)) $bk .= '_' . gmdate('YmdHis');   // a re-run never overwrites the ORIGINAL backup
update_user_meta($u, $bk, wp_slash(wp_json_encode($bak)));
echo "backup: $bk\n";
update_user_meta($u, $ck, wp_slash(wp_json_encode($d)));
if ($trim !== null && is_array($c)) {
    $c['history'] = $keep; $c['count'] = count($keep); $c['savedAt'] = gmdate('c');
    update_user_meta($u, $hk, wp_slash(wp_json_encode($c)));
}
if ($delPhase) delete_user_meta($u, $pk);
SWML_Session_Manager::reset_assessment_state($u, 'aqa', 'aqa_lang_paper_1', 1, '_reassessment', 1);
echo "written.\n";
