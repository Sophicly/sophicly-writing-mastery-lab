<?php
/**
 * heal-noplan-note.php — take the no-plan notice OUT of students' answer boxes (FIXLIST #448).
 *
 * WHAT WENT WRONG. From v7.20.204 to v7.20.570 the no-plan notice was prepended into the response
 * section's own inner HTML. It parsed as inline content of the FIRST input field — so on every AQA
 * Lang P1 Q1 / P2 Q1 style retrieval question the student opened, "No planning stage for this
 * one…" was sitting inside Point 1 as THEIR OWN WRITING. It counted toward their word count
 * (Neil's own doc: wordCount 34, all of it the notice), and it would have been marked as their
 * answer.
 *
 * v7.20.571 fixes the TEMPLATE, but a canvas document is baked at build time and saved — so every
 * document already created keeps the old shape for ever. Resetting the document is not a fix
 * either: it erases the student's work. This heals in place.
 *
 * WHAT IT DOES, per affected document:
 *   1. empties the input field whose content is the notice (leaving the field itself intact, so
 *      the student can still answer in it),
 *   2. inserts the notice back as its own read-only `noplan` section immediately before the
 *      response section it belongs to — the v7.20.571 shape,
 *   3. recomputes wordCount from the healed HTML, so the student stops being credited 34 words
 *      they did not write,
 *   4. backs the original up to `<key>_noplanheal_bak` first, so any document can be put back.
 *
 * It only ever touches a field whose ENTIRE content is the notice. A field the student has typed
 * into as well is left alone and reported, because guessing where the notice ends and their
 * answer begins is exactly the kind of edit that loses work.
 *
 * Usage:  wp eval-file heal-noplan-note.php                → DRY RUN across every user
 *         wp eval-file heal-noplan-note.php user=1355      → DRY RUN, one user
 *         wp eval-file heal-noplan-note.php apply          → heal every affected document
 *         wp eval-file heal-noplan-note.php apply user=1355
 *         wp eval-file heal-noplan-note.php revert         → restore every *_noplanheal_bak
 */

$mode = 'dry';
$only_user = 0;
foreach ($args as $a) {
    if ($a === 'apply')  $mode = 'apply';
    if ($a === 'revert') $mode = 'revert';
    if (strpos($a, 'user=') === 0) $only_user = absint(substr($a, 5));
}

global $wpdb;

const NOPLAN_MARK = 'No planning stage for this one';

$NOPLAN_SECTION = '<div data-section-type="noplan" data-section-label="No planning stage" '
    . 'data-editable="false" data-readonly="true" '
    . 'class="swml-section-block swml-section-noplan swml-section-readonly">'
    . '<p><em>No planning stage for this one — it’s a direct-response question. Answer it as well '
    . 'as you can; we don’t coach the method here, and it’s assessed later, not marked now. '
    . 'Do your best.</em></p></div>';

/** Decode a canvas meta value the way the app does (json, then unslashed json). */
function swml_decode_canvas($raw) {
    $d = json_decode($raw, true);
    if (!is_array($d)) $d = json_decode(wp_unslash($raw), true);
    return is_array($d) ? $d : null;
}

/**
 * The stored wordCount counts the student's RESPONSE areas only, not the whole document — so
 * recomputing it here from the full HTML would replace 34 with ~1300 and tell the student they had
 * written the question paper. We do not reimplement that counter; we SUBTRACT exactly the words we
 * removed. That is safe precisely because this script only ever empties a field whose entire
 * content was the notice, and it matches WML.countWords (wml-core.js) — a trim + whitespace split.
 */
function swml_count_words($text) {
    $s = trim((string) $text);
    if ($s === '') return 0;
    return count(array_filter(preg_split('/\s+/u', $s)));
}

// ── revert ────────────────────────────────────────────────────────────────────────────────────
if ($mode === 'revert') {
    $baks = $wpdb->get_results("SELECT user_id, meta_key FROM {$wpdb->usermeta} WHERE meta_key LIKE '%\\_noplanheal\\_bak'");
    echo count($baks) . " backup(s) found\n";
    foreach ($baks as $b) {
        $orig = substr($b->meta_key, 0, -strlen('_noplanheal_bak'));
        $val  = get_user_meta($b->user_id, $b->meta_key, true);
        update_user_meta($b->user_id, $orig, wp_slash($val));
        delete_user_meta($b->user_id, $b->meta_key);
        echo "  restored user {$b->user_id} {$orig}\n";
    }
    return;
}

// ── find candidates ───────────────────────────────────────────────────────────────────────────
$sql = "SELECT user_id, meta_key FROM {$wpdb->usermeta}
        WHERE meta_key LIKE 'swml\\_canvas\\_%'
          AND meta_key NOT LIKE '%\\_noplanheal\\_bak'
          AND meta_value LIKE '%" . $wpdb->esc_like(NOPLAN_MARK) . "%'";
if ($only_user) $sql .= $wpdb->prepare(" AND user_id = %d", $only_user);
$rows = $wpdb->get_results($sql);

echo ($mode === 'apply' ? 'APPLY' : 'DRY RUN') . " — " . count($rows) . " document(s) mention the notice\n\n";

$healed = 0; $already = 0; $mixed = 0; $skipped = 0;

foreach ($rows as $r) {
    $raw = get_user_meta($r->user_id, $r->meta_key, true);
    $d   = swml_decode_canvas($raw);
    if (!$d || !isset($d['html'])) { $skipped++; echo "  ⚠️  {$r->user_id} {$r->meta_key} — could not decode, LEFT ALONE\n"; continue; }
    $html = (string) $d['html'];

    // The three shapes the notice was actually found in on production. Each one is anchored on the
    // notice's own fixed wording — it opens with NOPLAN_MARK and closes on "Do your best." — so no
    // case has to guess where the student's writing starts.
    //
    //  1. WHOLE FIELD  — the notice is the entire content of an input field, the student never answered.
    //  2. PREFIX       — the notice opens an input field the student HAS since answered in, separated
    //                    from their writing by the <br>s it was prepended with. Only the notice and
    //                    those breaks are removed; every word the student typed is kept.
    //  3. PROSE        — the notice is italic prose inside a response section with no input field at
    //                    all (the checklist questions). It was never in an answer box and never
    //                    counted, but it sits in an editable section, so it is still moved into the
    //                    read-only section the v7.20.571 template uses.
    $re_whole  = '#(<div[^>]*data-input-field="true"[^>]*>)\s*(' . preg_quote(NOPLAN_MARK, '#') . '.*?Do your best\.)\s*(</div>)#us';
    $re_prefix = '#(<div[^>]*data-input-field="true"[^>]*>)\s*(' . preg_quote(NOPLAN_MARK, '#') . '.*?Do your best\.)\s*(?:<br\s*/?>\s*)+#us';
    $re_prose  = '#<p><em>\s*(' . preg_quote(NOPLAN_MARK, '#') . '.*?Do your best\.)\s*</em></p>#us';

    // A notice already sitting in its own read-only noplan section is CORRECT, and its wording is
    // identical to the broken copies — so a bare search finds it and would "heal" the fix itself,
    // leaving an empty section and adding a second one. Blank those sections out before matching.
    // The mask is the SAME LENGTH as what it covers, so every offset below still indexes $html.
    $probe = preg_replace_callback('#<div[^>]*data-section-type="noplan".*?</div>#us',
        static function ($mm) { return str_repeat(' ', strlen($mm[0])); }, $html);

    if (preg_match($re_whole, $probe, $m, PREG_OFFSET_CAPTURE)) {
        $kind = 'emptied the answer box';
        $removed_words = swml_count_words(wp_strip_all_tags($m[2][0]));
        $cut_at  = $m[1][1] + strlen($m[1][0]);          // just inside the field's opening tag
        $cut_len = $m[3][1] - $cut_at;                   // …up to its closing tag
    } elseif (preg_match($re_prefix, $probe, $m, PREG_OFFSET_CAPTURE)) {
        $kind = 'took the notice off the front of the answer box, kept the student writing';
        $removed_words = swml_count_words(wp_strip_all_tags($m[2][0]));
        $cut_at  = $m[1][1] + strlen($m[1][0]);          // just inside the field's opening tag
        $cut_len = ($m[0][1] + strlen($m[0][0])) - $cut_at;  // …notice + the <br>s, nothing after
    } elseif (preg_match($re_prose, $probe, $m, PREG_OFFSET_CAPTURE)) {
        $kind = 'moved the notice out of the editable section';
        $removed_words = 0;   // never sat in an answer box, so it was never in the word count
        $cut_at  = $m[0][1];
        $cut_len = strlen($m[0][0]);
    } elseif (strpos($html, 'data-section-type="noplan"') !== false) {
        $already++; continue;   // already the v7.20.571 shape
    } else {
        // Present, but in a shape none of the three anchors matched — never guess at it.
        $mixed++;
        echo "  ⚠️  {$r->user_id} {$r->meta_key} — notice present in an unrecognised shape; LEFT ALONE for a human\n";
        continue;
    }

    $html = substr($html, 0, $cut_at) . substr($html, $cut_at + $cut_len);

    // Put the notice back as its own read-only section, immediately before the response section
    // that owns the field we just emptied. Everything before the cut is untouched, so the offset
    // still points at the right place.
    $sec = strrpos(substr($html, 0, $cut_at), '<div data-section-type="response"');
    if ($sec !== false) {
        $html = substr($html, 0, $sec) . $NOPLAN_SECTION . substr($html, $sec);
    } else {
        echo "  ⚠️  {$r->user_id} {$r->meta_key} — emptied the field but found no response section to anchor the notice to\n";
    }

    $wc_old = (int) ($d['wordCount'] ?? 0);
    $wc_new = max(0, $wc_old - $removed_words);
    echo sprintf("  ✔ %-5d %-58s words %d → %d  (removed %d)\n     %s\n",
        $r->user_id, $r->meta_key, $wc_old, $wc_new, $removed_words, $kind);

    // A document can carry the notice more than once. Each pass heals one, so say so out loud
    // rather than reporting a clean run over a half-healed document. Mask again first — otherwise
    // the section we just inserted counts itself and every document looks like it has a second one.
    $rest = preg_replace_callback('#<div[^>]*data-section-type="noplan".*?</div>#us',
        static function ($mm) { return str_repeat(' ', strlen($mm[0])); }, $html);
    if (preg_match($re_whole, $rest) || preg_match($re_prefix, $rest) || preg_match($re_prose, $rest)) {
        echo "     ⚠️  this document carries the notice more than once — re-run to heal the next one\n";
    }

    if ($mode === 'apply') {
        update_user_meta($r->user_id, $r->meta_key . '_noplanheal_bak', wp_slash($raw));
        $d['html'] = $html;
        $d['wordCount'] = $wc_new;
        update_user_meta($r->user_id, $r->meta_key, wp_slash(wp_json_encode($d)));

        // Round-trip check — a write that decodes back differently is worse than no write.
        $back = swml_decode_canvas(get_user_meta($r->user_id, $r->meta_key, true));
        if (!$back || ($back['html'] ?? null) !== $html) {
            echo "     ⛔ ROUND-TRIP FAILED — restoring the backup for this document\n";
            update_user_meta($r->user_id, $r->meta_key, wp_slash($raw));
            continue;
        }
    }
    $healed++;
}

echo "\nhealed: {$healed}   already v7.20.571 shape: {$already}   left for a human: {$mixed}   undecodable: {$skipped}\n";
if ($mode !== 'apply') echo "\nDRY RUN — re-run with `apply` to write. `revert` restores every backup.\n";
