<?php
/**
 * FIXLIST #630 one-off repair — a Phase-2 REASSESSMENT doc that inherited Phase-1 marks.
 * Usage (staging test student):  RU=1938 wp eval "require \"/tmp/repair-630-reassessment.php\";"
 * Usage (PRODUCTION student, only on Neil's go):  RU=857 RLIVE=1 wp eval "require \"/tmp/repair-630-reassessment.php\";"
 * What it does (all backed up first in user meta swml_bak_20260928_630_reassess_repair):
 *   1. runs SWML_REST_API::reset_marking_output() on the reassessment doc (Feedback boxes, calib rows, Overall Feedback)
 *   2. trims the chat to its first 118 turns (Qamar: drops the 3 junk "marks filed" + SYSTEM pairs)
 *   3. deletes the false swml_phase_…_t1_redraft record written by the carried-marks auto-commit
 * Keys are AQA Lang P1 Topic 1 (Qamar). Adjust before reusing for anyone else.
 */
$u=(int)getenv('RU'); $live=getenv('RLIVE')==='1';
if(!$live && strpos(get_userdata($u)->user_email,'neilson248+')!==0) die("refuse\n");
$ck='swml_canvas_aqa_aqa_lang_paper_1_t1_reassessment'; $hk='swml_chat_aqa_aqa_lang_paper_1_t1_reassessment'; $pk='swml_phase_aqa_aqa_lang_paper_1_t1_redraft';
$bak=['canvas'=>get_user_meta($u,$ck,true),'chat'=>get_user_meta($u,$hk,true),'phase'=>get_user_meta($u,$pk,true)];
update_user_meta($u,'swml_bak_20260928_630_reassess_repair',wp_slash(wp_json_encode($bak)));
$d=json_decode($bak['canvas'],true); if(!is_array($d)) $d=json_decode(wp_unslash($bak['canvas']),true);
$before=substr_count($d['html'],'data-section-type='); $d['html']=SWML_REST_API::reset_marking_output($d['html']); $after=substr_count($d['html'],'data-section-type=');
preg_match_all('/data-section-label="(Feedback: Q[^"]*)"/',$d['html'],$fm);
update_user_meta($u,$ck,wp_slash(wp_json_encode($d)));
$c=json_decode($bak['chat'],true); if(!is_array($c)) $c=json_decode(wp_unslash($bak['chat']),true);
$n0=count($c['history']); $keep=[]; foreach($c['history'] as $i=>$m){ if($i>=118) break; $keep[]=$m; } $c['history']=$keep; $c['count']=count($keep); $c['savedAt']=gmdate('c');
update_user_meta($u,$hk,wp_slash(wp_json_encode($c)));
delete_user_meta($u,$pk);
echo "user $u: sections $before→$after; boxes: ".implode(' | ',$fm[1])."; chat $n0→".count($keep)." (last: ".substr($keep[117]['content'],0,20).") ; phase record deleted (was ".substr((string)$bak['phase'],0,50).")\n";
