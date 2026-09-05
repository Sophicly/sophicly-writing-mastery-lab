<?php
/**
 * live-modelling-access-gate.php — proves the v7.20.589 designated-author grant (#447) does
 * EXACTLY what the plan says and nothing wider. Run on STAGING:
 *
 *   wp eval-file bin/live-modelling-access-gate.php author=<uid> student=<uid> [parent=<uid> child=<uid>]
 *
 * Every assertion names the case it guards. Injection check: drop the author branch from
 * resolve_viewer_mode() and cases 1/6/7 fail. The option is restored to its prior value on exit.
 */
if (!defined('ABSPATH')) { fwrite(STDERR, "run with wp eval-file\n"); exit(1); }

$opt = ['author' => 0, 'student' => 0, 'parent' => 0, 'child' => 0];
foreach ((array) $args as $a) { if (preg_match('/^(author|student|parent|child)=(\d+)$/', $a, $m)) $opt[$m[1]] = (int) $m[2]; }
if (!$opt['author'] || !$opt['student']) { echo "usage: author=<uid> student=<uid> [parent=<uid> child=<uid>]\n"; exit(1); }
$A = $opt['author']; $S = $opt['student']; $P = $opt['parent']; $C = $opt['child'];
$admin = (int) get_users(['role' => 'administrator', 'number' => 1, 'fields' => 'ID'])[0];

$GLOBALS['swml_lm_fails'] = 0; $GLOBALS['swml_lm_n'] = 0;
function ok($cond, $label) { $GLOBALS['swml_lm_n']++; echo ($cond ? '  ✓ ' : '  ✗ ') . $label . "\n"; if (!$cond) $GLOBALS['swml_lm_fails']++; }
$cls = 'Sophicly_Writing_Mastery_Lab';
$prior = get_option('swml_live_modelling_authors', null);
$restore = function () use ($prior) { if ($prior === null) delete_option('swml_live_modelling_authors'); else update_option('swml_live_modelling_authors', $prior, false); };

// ── 1. INERT until seeded ─────────────────────────────────────────────────────────────────
delete_option('swml_live_modelling_authors');
echo "\n[1] option absent\n";
ok($cls::resolve_viewer_mode($S, $A) === false, "student→author is FALSE while no author is designated (feature inert)");
ok($cls::live_modelling_authors() === [], "live_modelling_authors() is [] when unset");

// ── 2. seeded ─────────────────────────────────────────────────────────────────────────────
update_option('swml_live_modelling_authors', [$A], false);
echo "\n[2] option = [$A]\n";
ok($cls::resolve_viewer_mode($S, $A) === 'readonly', "student→author is 'readonly'");
ok($cls::resolve_viewer_mode($A, $A) === 'edit',     "author→self is 'edit'");
ok($cls::resolve_viewer_mode($admin, $A) === 'comment', "admin→author is 'comment' (unchanged tier)");
// a second student: the grant is per TARGET, never per viewer
$other = (int) get_users(['meta_key' => 'sophicly_role', 'meta_value' => 'student', 'exclude' => [$S, $A], 'number' => 1, 'fields' => 'ID'])[0] ?? 0;
if ($other) ok($cls::resolve_viewer_mode($S, $other) === false, "student→another student is still FALSE (grant is on the target, not the viewer)");
ok($cls::resolve_viewer_mode($S, $S) === 'edit', "student→self still 'edit'");
if ($P && $C) {
    ok($cls::resolve_viewer_mode($P, $C) === 'readonly', "linked parent→child still 'readonly'");
    if ($other && $other !== $C) ok($cls::resolve_viewer_mode($P, $other) === false, "parent→unlinked student still FALSE");
    ok($cls::resolve_viewer_mode($P, $A) === 'readonly', "parent→author is 'readonly' (parents may watch too)");
}
ok($cls::resolve_viewer_mode(0, $A) === false, "logged-out→author is FALSE");

// ── 3. review context: the lesson binds the author, no URL param ─────────────────────────
echo "\n[3] resolve_review_context() with embed_author_id = $A\n";
$plugin = $cls::instance();
$rp = new ReflectionProperty($cls, 'embed_author_id'); $rp->setAccessible(true);
$rm = new ReflectionMethod($cls, 'resolve_review_context'); $rm->setAccessible(true);
unset($_GET['view_as'], $_GET['student_id']);
$rp->setValue($plugin, $A);
wp_set_current_user($S);
$ctx = $rm->invoke($plugin);
ok(!empty($ctx['review_mode']) && (int) $ctx['target_user_id'] === $A, "student on the lesson → review_mode with target = author (served $ctx[target_user_id])");
ok(($ctx['viewer_mode'] ?? '') === 'readonly', "…viewer_mode 'readonly' (got '" . ($ctx['viewer_mode'] ?? '') . "')");
ok(($ctx['review_role'] ?? '') === 'live_modelling', "…review_role 'live_modelling' (got '" . ($ctx['review_role'] ?? '') . "')");
wp_set_current_user($A);
$ctx = $rm->invoke($plugin);
ok(empty($ctx['review_mode']) && ($ctx['viewer_mode'] ?? '') === 'edit', "author on the lesson → NOT review mode, 'edit'");
wp_set_current_user($admin);
$ctx = $rm->invoke($plugin);
ok(!empty($ctx['review_mode']) && ($ctx['viewer_mode'] ?? '') === 'comment' && ($ctx['review_role'] ?? '') === 'admin', "admin on the lesson → review 'comment' as admin (unchanged)");
$rp->setValue($plugin, 0);
wp_set_current_user($S);
$ctx = $rm->invoke($plugin);
ok(empty($ctx['review_mode']), "student on an ordinary lesson (no author) → own document, not review");

// ── 4. REST: the read is allowed, the write is refused ───────────────────────────────────
echo "\n[4] REST as the student against the author's document\n";
wp_set_current_user($S);
$q = ['board' => 'aqa', 'text' => 'aqa_lang_paper_1', 'topicNumber' => 11, 'suffix' => '', 'student_id' => $A];
$req = new WP_REST_Request('GET', '/sophicly-wml/v1/canvas/load'); foreach ($q as $k => $v) $req->set_param($k, $v);
$res = rest_do_request($req);
ok(!$res->is_error() && $res->get_status() === 200, "GET canvas/load student_id=author → 200 (got " . $res->get_status() . ")");
$req = new WP_REST_Request('GET', '/sophicly-wml/v1/canvas/review'); foreach ($q as $k => $v) $req->set_param($k, $v); $req->set_param('topicNumber', 11);
$res = rest_do_request($req);
ok(!$res->is_error() && $res->get_status() === 200, "GET canvas/review student_id=author → 200 — the route the review UI actually uses (got " . $res->get_status() . ")");
$req = new WP_REST_Request('GET', '/sophicly-wml/v1/canvas/review-chat'); foreach ($q as $k => $v) $req->set_param($k, $v);
$res = rest_do_request($req);
ok(!$res->is_error() && $res->get_status() === 200, "GET canvas/review-chat student_id=author → 200 (got " . $res->get_status() . ")");
$req = new WP_REST_Request('POST', '/sophicly-wml/v1/canvas/save');
$req->set_body_params(['board' => 'aqa', 'text' => 'aqa_lang_paper_1', 'topicNumber' => 11, 'student_id' => $A, 'document' => ['type' => 'doc', 'content' => []]]);
$res = rest_do_request($req);
ok($res->get_status() === 403, "POST canvas/save student_id=author → 403 (got " . $res->get_status() . ")");
$req = new WP_REST_Request('POST', '/sophicly-wml/v1/canvas/tutor-comment');
$req->set_body_params(['board' => 'aqa', 'text' => 'aqa_lang_paper_1', 'topicNumber' => 11, 'student_id' => $A, 'comment' => ['text' => 'x']]);
$res = rest_do_request($req);
ok($res->get_status() >= 400, "POST canvas/tutor-comment as the student → refused (got " . $res->get_status() . ")");

// ── 5. topic store sibling fallback ──────────────────────────────────────────────────────
echo "\n[5] topic store sibling fallback\n";
$sib = SWML_Topic_Questions::sibling_text_slugs('aqa', 'language1');
ok(in_array('aqa_lang_paper_1', $sib, true) && in_array('language_p1', $sib, true), "aqa/language1 siblings include aqa_lang_paper_1 + language_p1 (" . implode(',', $sib) . ")");
ok(SWML_Topic_Questions::sibling_text_slugs('aqa', 'macbeth') === [], "non-language text has no siblings");
$t = SWML_Topic_Questions::get_topic('aqa', 'aqa_lang_paper_1', 11);
ok(is_array($t) && stripos($t['label'] ?? '', 'Rosabel') !== false, "Rosabel resolves under the canonical slug");

$restore();
$fails = $GLOBALS['swml_lm_fails']; $n = $GLOBALS['swml_lm_n'];
echo "\n" . ($fails ? "❌ $fails of $n FAILED" : "✅ $n/$n passed") . "\n";
exit($fails ? 1 : 0);
