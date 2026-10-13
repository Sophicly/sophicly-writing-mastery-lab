<?php
/**
 * SWML_Canvas_Safety — v7.20.854 (FIXLIST never-again-1298). THE SERVER'S SAFETY NET FOR A STUDENT'S DOCUMENT.
 *
 * Neil, 13 Oct, after Anam's plan vanished from her page: "how can we ensure that the same problem never occurs again?"
 * The page has many paths that put something else where a document was (a template, an earlier draft, a stale copy).
 * bin/doc-replace-lint.js now makes each one decide through ONE rule — but a rule in the page can only stop the
 * mistakes someone has thought of. This is the half that does not depend on that: before a save replaces a stored
 * document with one that holds LESS of a person's work, the stored version is copied aside. Whatever the page does,
 * no save can destroy work beyond recovery, and every time this fires the log says so.
 *
 *   "less work" = fewer filled boxes, OR at least 200 characters and 30% of the written text gone.
 *   Kept per document: 3 copies — the newest two, plus the richest one ever copied (so a run of bad saves can never
 *   push the good version out). Key: wml_docbak_{md5(document key)}. ⛔ Never a key starting `swml_canvas`: several
 *   readers scan `LIKE 'swml_canvas_%'` unescaped (student-data, the canvas listing), and would read a copy as a
 *   document.
 *
 * Restore (WP-CLI on the server, never from a page):
 *   wp eval 'print_r(SWML_Canvas_Safety::list_backups(1298, "swml_canvas_aqa_aqa_lang_paper_2_t1_planning"));'
 *   wp eval 'print_r(SWML_Canvas_Safety::restore(1298, "swml_canvas_aqa_aqa_lang_paper_2_t1_planning", 0));'
 * A restore first copies the current document aside (so it can itself be undone) and stamps a fresh savedAt, so the
 * student's own browser loads the restored copy instead of saving its older one back over it (_serverCopyWins).
 *
 * Gate: bin/canvas-safety-harness.php (pure functions + the wp_slash round-trip, falsified).
 */
if (!defined('ABSPATH') && !defined('SWML_SAFETY_TEST')) exit;

class SWML_Canvas_Safety {

    const PREFIX = 'wml_docbak_';
    const KEEP   = 3;

    /** PURE. What a person wrote in a document: filled boxes (unlocked inputs / outline rows, chosen selects) and the
     *  characters in those boxes plus every response and feedback section. A document with no sections at all (an old
     *  plain essay) counts all of its text. */
    public static function person_work($html) {
        $out = ['boxes' => 0, 'chars' => 0];
        $html = (string) $html;
        if (trim($html) === '') return $out;
        $prev = libxml_use_internal_errors(true);
        $dom = new \DOMDocument();
        $ok = $dom->loadHTML('<?xml encoding="utf-8"?><div id="swml-safety-root">' . $html . '</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();
        libxml_use_internal_errors($prev);
        if (!$ok) { $out['chars'] = self::len(strip_tags($html)); return $out; }
        $xp = new \DOMXPath($dom);
        $boxQ = '//*[(@data-input-field="true" or @data-outline-row="true") and not(@data-locked="true")]';
        $boxText = 0;
        foreach ($xp->query($boxQ) as $b) {
            $t = self::len($b->textContent);
            if ($t > 0) { $out['boxes']++; $boxText += $t; }
        }
        foreach ($xp->query('//*[@data-select-field="true"][@data-value and @data-value!=""]') as $s) { $out['boxes']++; }
        $secText = 0;
        $sections = $xp->query('//*[@data-section-type="response" or @data-section-type="feedback"]');
        foreach ($sections as $sec) {
            $t = self::len($sec->textContent);
            foreach ($xp->query('.//*[(@data-input-field="true" or @data-outline-row="true") and not(@data-locked="true")]', $sec) as $inner) {
                $t -= self::len($inner->textContent);   // a box inside a section is already counted once
            }
            $secText += max(0, $t);
        }
        $out['chars'] = $boxText + $secText;
        if ($xp->query('//*[@data-section-type]')->length === 0) {
            $out['chars'] = max($out['chars'], self::len($dom->textContent));
        }
        return $out;
    }

    private static function len($s) {
        $s = trim(preg_replace('/\s+/', ' ', (string) $s));
        return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
    }

    /** PURE. Does going from $before to $after lose a person's work? */
    public static function loses_work(array $before, array $after) {
        if ((int) $after['boxes'] < (int) $before['boxes']) return true;
        $lost = (int) $before['chars'] - (int) $after['chars'];
        return $lost >= 200 && $lost >= 0.3 * (int) $before['chars'];
    }

    /** PURE. Add a copy to a document's ring: keep the newest two and the richest ever copied. */
    public static function ring_add(array $entries, array $entry, $keep = self::KEEP) {
        $entries[] = $entry;
        while (count($entries) > $keep) {
            $richest = 0;
            foreach ($entries as $i => $e) {
                $a = $e['before'] ?? ['chars' => 0, 'boxes' => 0];
                $r = $entries[$richest]['before'] ?? ['chars' => 0, 'boxes' => 0];
                if ([(int) $a['chars'], (int) $a['boxes']] > [(int) $r['chars'], (int) $r['boxes']]) $richest = $i;
            }
            $newest = count($entries) - 1;
            foreach ($entries as $i => $e) {
                if ($i !== $richest && $i !== $newest) { array_splice($entries, $i, 1); break; }
            }
        }
        return array_values($entries);
    }

    public static function backup_key($doc_key) {
        return self::PREFIX . md5((string) $doc_key);
    }

    /** The html inside a stored document value (a JSON string as get_user_meta returns it, or a legacy array). */
    public static function stored_html($raw) {
        $doc = self::decode($raw);
        return is_array($doc) ? (string) ($doc['html'] ?? '') : '';
    }

    private static function decode($raw) {
        if (is_array($raw)) return $raw;
        if (!is_string($raw) || $raw === '') return null;
        $d = json_decode($raw, true);
        if (is_array($d)) return $d;
        $d = json_decode(wp_unslash($raw), true);
        return is_array($d) ? $d : null;
    }

    /**
     * Called by every server path that overwrites a document's html, BEFORE it writes. When the incoming html holds
     * less of a person's work than the stored one, the stored value is copied aside. Never blocks the save.
     * Returns true when a copy was made.
     */
    public static function guard_write($user_id, $doc_key, $existing_raw, $incoming_html, $source) {
        try {
            if (empty($existing_raw)) return false;
            $before = self::person_work(self::stored_html($existing_raw));
            if ($before['boxes'] === 0 && $before['chars'] === 0) return false;
            $after = self::person_work($incoming_html);
            if (!self::loses_work($before, $after)) return false;
            return self::add_copy($user_id, $doc_key, $existing_raw, $source, $before, $after);
        } catch (\Throwable $e) {
            error_log(sprintf('[WML doc-safety] guard failed user=%d key=%s: %s', (int) $user_id, (string) $doc_key, $e->getMessage()));
            return false;
        }
    }

    private static function add_copy($user_id, $doc_key, $existing_raw, $source, array $before, array $after) {
        $key  = self::backup_key($doc_key);
        $ring = get_user_meta($user_id, $key, true);
        if (!is_array($ring) || !isset($ring['entries']) || !is_array($ring['entries'])) $ring = ['doc_key' => (string) $doc_key, 'entries' => []];
        $doc = self::decode($existing_raw);
        $ring['entries'] = self::ring_add($ring['entries'], [
            'at'       => current_time('c'),
            'ts'       => time(),
            'source'   => (string) $source,
            'saved_at' => is_array($doc) ? (string) ($doc['savedAt'] ?? '') : '',
            'before'   => $before,
            'after'    => $after,
            'raw'      => $existing_raw,
        ]);
        // ⚠️ update_user_meta UNSLASHES what it is given — the stored JSON's backslashes must survive (root CLAUDE.md).
        update_user_meta($user_id, $key, wp_slash($ring));
        error_log(sprintf('[WML doc-safety] COPIED ASIDE user=%d key=%s source=%s boxes %d→%d chars %d→%d (%s)',
            (int) $user_id, (string) $doc_key, (string) $source, $before['boxes'], $after['boxes'], $before['chars'], $after['chars'], $key));
        return true;
    }

    /** The copies held for one document, newest last, without their contents. */
    public static function list_backups($user_id, $doc_key) {
        $ring = get_user_meta($user_id, self::backup_key($doc_key), true);
        if (!is_array($ring) || empty($ring['entries'])) return [];
        $out = [];
        foreach ($ring['entries'] as $i => $e) {
            $out[] = ['index' => $i, 'at' => $e['at'] ?? '', 'source' => $e['source'] ?? '', 'saved_at' => $e['saved_at'] ?? '',
                      'before' => $e['before'] ?? null, 'after' => $e['after'] ?? null,
                      'bytes' => is_string($e['raw'] ?? null) ? strlen($e['raw']) : 0];
        }
        return $out;
    }

    /** Put copy $index back as the document. The current document is copied aside first, so this can be undone. */
    public static function restore($user_id, $doc_key, $index) {
        $ring = get_user_meta($user_id, self::backup_key($doc_key), true);
        $e = (is_array($ring) && isset($ring['entries'][$index])) ? $ring['entries'][$index] : null;
        if (!$e) return ['ok' => false, 'why' => 'no copy at that index'];
        $doc = self::decode($e['raw'] ?? null);
        if (!is_array($doc) || !isset($doc['html'])) return ['ok' => false, 'why' => 'the copy does not decode'];
        $current = get_user_meta($user_id, $doc_key, true);
        if (!empty($current)) {
            self::add_copy($user_id, $doc_key, $current, 'pre-restore',
                self::person_work(self::stored_html($current)), self::person_work($doc['html']));
        }
        $doc['restoredFrom'] = $doc['savedAt'] ?? '';
        $doc['savedAt'] = current_time('c');   // newer than any browser's copy → the page loads this one
        $ok = update_user_meta($user_id, $doc_key, wp_slash(wp_json_encode($doc)));
        error_log(sprintf('[WML doc-safety] RESTORED user=%d key=%s from copy %d (saved %s)', (int) $user_id, (string) $doc_key, (int) $index, (string) $doc['restoredFrom']));
        return ['ok' => $ok !== false, 'restored_from' => $doc['restoredFrom'], 'work' => self::person_work($doc['html'])];
    }
}
