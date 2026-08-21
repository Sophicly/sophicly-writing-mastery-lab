#!/usr/bin/env php
<?php
/**
 * protocol-group-map-gate — every board in the protocol-group map must be REACHABLE.
 * ==================================================================================
 * v7.20.542. Written after the Cambridge lane found the defect and it measured worse than
 * anyone had assumed.
 *
 * THE DEFECT THIS EXISTS TO STOP
 * ------------------------------
 * `resolve_protocol_group()` builds its lookup key as `str_replace('-', '_', $board)`, but the
 * map's own top-level keys were written HYPHENATED for the two IGCSE boards. Every other board
 * key contains no hyphen, so the mismatch was invisible — and the entries for `edexcel-igcse`
 * and `cambridge-igcse` were simply unreachable. The lookup missed and fell through to
 * `return sanitize_key($subject)`, returning the SUBJECT where the map says the GROUP.
 *
 * It survived unnoticed because for `language1`/`language2` the map VALUE equals the SUBJECT, so
 * the two most-trafficked subjects kept working. The other eight Edexcel IGCSE subjects resolved
 * to directories that do not exist, which makes `assessment` return NULL — the board could not be
 * marked at all.
 *
 * ⭐ THE LESSON IS THE §5d ONE: a key that is never emitted is a branch that can never be taken,
 * and nothing in a test suite that only exercises the happy subjects will ever notice. This gate
 * asserts the map is REACHABLE, not merely well-formed.
 *
 * WHAT IT CHECKS
 *   A. REACHABILITY — every top-level map key must equal its own normalised form, i.e. it must
 *      match the key the lookup actually builds. A hyphen here is a dead entry.
 *   B. RESOLUTION — every (board, subject) => group must name a real protocol directory, OR be
 *      covered by a declared fallback (AQA for planning/polishing, shared/ for the shared tasks).
 *      Anything else is reported, because a group with no directory anywhere means `assessment`
 *      returns null for that subject.
 *
 * ⛔ WHAT A PASS DOES NOT MEAN: that the protocol is CORRECT, or that a real lesson resolves to
 * the subject you think it does. That is the slug-trace (§0c) and it needs a real lesson.
 */

$root = dirname(__DIR__);
$routerFile = $root . '/includes/class-protocol-router.php';
if (!file_exists($routerFile)) { fwrite(STDERR, "protocol-group-map-gate: router not found\n"); exit(1); }
$src = file_get_contents($routerFile);

// ── Lift the map literal out of resolve_protocol_group, then eval ONLY that literal. ──
// Parsing the array by regex would duplicate the subject (a check that re-implements the thing
// it checks tests its own memory); evaluating the real literal cannot drift from it.
$start = strpos($src, 'private function resolve_protocol_group');
if ($start === false) { fwrite(STDERR, "protocol-group-map-gate: resolve_protocol_group not found\n"); exit(1); }
$mapStart = strpos($src, '$map = [', $start);
if ($mapStart === false) { fwrite(STDERR, "protocol-group-map-gate: \$map literal not found\n"); exit(1); }
$open = strpos($src, '[', $mapStart);
$depth = 0; $end = null;
for ($i = $open; $i < strlen($src); $i++) {
    if ($src[$i] === '[') $depth++;
    elseif ($src[$i] === ']') { $depth--; if ($depth === 0) { $end = $i; break; } }
}
if ($end === null) { fwrite(STDERR, "protocol-group-map-gate: unbalanced \$map literal\n"); exit(1); }
$literal = substr($src, $open, $end - $open + 1);
$map = eval("return $literal;");
if (!is_array($map) || !$map) { fwrite(STDERR, "protocol-group-map-gate: \$map did not evaluate to an array\n"); exit(1); }

// The lookup key the router actually builds, reproduced from the one line that builds it.
$lookupKey = function ($board) { return str_replace('-', '_', $board); };

// ── KNOWN GAPS — literature subjects that have no protocol on any board path TODAY. ──
// These are NOT caused by the key defect and NOT introduced by this gate; they are boards whose
// literature side was never built. They are listed rather than filtered so the hole stays VISIBLE
// (no silent caps), and so that a NEW hole — a board we have started and left half-built — fails
// the build instead of joining a silent pile.
//
// ⚠️ WHAT THIS LIST MEANS IN PRACTICE: for each entry, `assessment` and `exam_question` return
// NULL, so WML cannot mark that subject for that board at all. Measured 2026-08-21, on the day
// Cambridge Paper 1 + 2 were installed. Removing an entry is how you prove one has been built.
$KNOWN_GAPS = [
    'ocr/modern_text',              // OCR literature: never built
    'sqa/shakespeare', 'sqa/modern_text', 'sqa/19th_century',
    'ccea/shakespeare', 'ccea/modern_text', 'ccea/19th_century',
    // Cambridge: Paper 1 + Paper 2 (language) shipped 2026-08-21; the LITERATURE side is not built.
    // The 0992/0475 literature papers are a separate job and nobody has a student sitting one yet.
    'cambridge_igcse/shakespeare', 'cambridge_igcse/modern_text', 'cambridge_igcse/19th_century',
];

$errors = [];
$warnings = [];
$knownHit = [];
$checked = 0;

// ── A. every top-level key must be reachable by the key the lookup builds ──
foreach (array_keys($map) as $boardKey) {
    if ($lookupKey($boardKey) !== $boardKey) {
        $errors[] = "UNREACHABLE BOARD KEY '{$boardKey}' — the lookup builds '" . $lookupKey($boardKey) .
                    "', so every subject under it falls through to the subject-as-directory fallback. " .
                    "This is the defect that made Cambridge and Edexcel IGCSE unmarkable.";
    }
}

// ── B. every mapped group must name a real protocol directory, or a declared fallback ──
// The directory is the HYPHENATED board form (protocols/edexcel-igcse/…), while the map key is
// the underscore form — the two live in different spellings on purpose, which is half of why the
// original defect was easy to write.
foreach ($map as $boardKey => $subjects) {
    $boardDir = str_replace('_', '-', $boardKey);
    foreach ($subjects as $subject => $group) {
        $checked++;
        $own    = $root . "/protocols/{$boardDir}/{$group}/manifest.json";
        $shared = $root . "/protocols/shared/{$group}/manifest.json";
        $aqa    = $root . "/protocols/aqa/{$group}/manifest.json";
        if (file_exists($own)) continue;                    // board has its own — best case
        if (file_exists($aqa) || file_exists($shared)) {     // covered by a declared fallback
            $warnings[] = sprintf('%-16s %-22s → %-16s no board protocol; falls back to %s',
                $boardKey, $subject, $group, file_exists($aqa) ? 'aqa/' : 'shared/');
            continue;
        }
        $id = "{$boardKey}/{$subject}";
        $line = "NO PROTOCOL ANYWHERE for {$id} → group '{$group}' " .
                "(tried protocols/{$boardDir}/{$group}, protocols/aqa/{$group}, protocols/shared/{$group}). " .
                "`assessment` and `exam_question` return NULL for this subject — the board cannot be marked.";
        if (in_array($id, $KNOWN_GAPS, true)) { $knownHit[] = $id; } else { $errors[] = $line; }
    }
}

if ($errors) {
    fwrite(STDERR, "\033[31m✖ protocol-group-map-gate FAILED\033[0m\n\n");
    foreach ($errors as $e) fwrite(STDERR, "  · $e\n");
    fwrite(STDERR, "\n");
    exit(1);
}

// A stale entry is its own defect: it claims a hole that has since been filled, and it would
// hide a REGRESSION at that exact spot. Fail on it, the same way a retired colour is lint-blocked.
$stale = array_diff($KNOWN_GAPS, $knownHit);
if ($stale) {
    fwrite(STDERR, "\033[31m✖ protocol-group-map-gate: KNOWN_GAPS lists entries that now resolve — delete them:\033[0m\n");
    foreach ($stale as $x) fwrite(STDERR, "  · {$x}\n");
    exit(1);
}

if ($warnings) {
    echo "\033[33mprotocol-group-map-gate — subjects with no board protocol (fallback in use, not an error):\033[0m\n";
    foreach ($warnings as $w) echo "  $w\n";
}
if ($knownHit) {
    echo "\033[33mprotocol-group-map-gate — " . count($knownHit) . " KNOWN GAP(S): no protocol anywhere, so these " .
         "subjects CANNOT BE MARKED (not a regression; listed so it stays visible):\033[0m\n";
    foreach ($knownHit as $k) echo "  · {$k}\n";
}
echo "\033[32m✔ protocol-group-map-gate: " . count($map) . " board(s), {$checked} subject mapping(s) — " .
     "every board key is reachable and every group resolves.\033[0m\n";
