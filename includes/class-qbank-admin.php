<?php
/**
 * WML Q-Bank / Crib Template Admin (v7.19.180)
 *
 * Admin page for uploading new crib JSON templates without invoking wml-chat.
 * Uploaded files override the bundled shipping defaults at
 * protocols/shared/crib-templates/{slug}.json.
 *
 * Override location: wp-content/uploads/sophicly-qbank-uploads/{slug}.json
 *
 * On every student canvas load, if the saved snapshot's _template_version is
 * older than the resolved disk template_version, merge_student_responses_into_template()
 * fires automatically (class-rest-api.php:1636-1668) — preserving plan + response
 * elements the student typed into, refreshing everything else.
 *
 * @package Sophicly_Writing_Mastery_Lab
 * @version 7.19.180
 */

if (!defined('ABSPATH')) exit;

class SWML_Qbank_Admin {

    const UPLOADS_SUBDIR = 'sophicly-qbank-uploads';
    const MAX_UPLOAD_BYTES = 1048576; // 1 MB

    /** v7.19.181: per-slug parser routing for .md uploads. */
    private static $parser_map = [
        'inspector_calls'   => ['script' => 'qbank-modern-text-md-to-tiptap.js', 'mode' => 'file_out'],
        'blood_brothers'    => ['script' => 'qbank-modern-text-md-to-tiptap.js', 'mode' => 'file_out'],
        'animal_farm'       => ['script' => 'qbank-modern-text-md-to-tiptap.js', 'mode' => 'file_out'],
        'anita_and_me'      => ['script' => 'qbank-modern-text-md-to-tiptap.js', 'mode' => 'file_out'],
        'lord_of_the_flies' => ['script' => 'qbank-modern-text-md-to-tiptap.js', 'mode' => 'file_out'],
        'leave_taking'      => ['script' => 'qbank-modern-text-md-to-tiptap.js', 'mode' => 'file_out'],
        'worlds_lives_poetry'       => ['script' => 'qbank-md-to-tiptap.js', 'mode' => 'stdout'],
        'love_relationships_poetry' => ['script' => 'qbank-md-to-tiptap.js', 'mode' => 'stdout'],
        'power_conflict_poetry'     => ['script' => 'qbank-md-to-tiptap.js', 'mode' => 'stdout'],
        'unseen_poetry'             => ['script' => 'qbank-unseen-poetry-to-tiptap.js', 'mode' => 'stdout'],
    ];

    private static $instance = null;

    public static function instance() {
        if (null === self::$instance) self::$instance = new self();
        return self::$instance;
    }

    private function __construct() {
        add_action('admin_menu', [$this, 'add_menu']);
        add_action('admin_post_swml_qbank_upload',  [$this, 'handle_upload']);
        add_action('admin_post_swml_qbank_revert',  [$this, 'handle_revert']);
        add_action('admin_post_swml_qbank_refresh', [$this, 'handle_refresh']);
    }

    public function add_menu() {
        $parent = class_exists('Sophicly_Admin_Hub') ? 'sophicly' : 'options-general.php';
        add_submenu_page(
            $parent,
            'WML Crib Templates',
            'WML Crib Templates',
            'manage_options',
            'sophicly-wml-qbanks',
            [$this, 'render_page']
        );
    }

    /** Absolute path to uploads override dir; mkdir if missing. */
    private function uploads_dir() {
        $u = wp_upload_dir();
        if (empty($u['basedir'])) return null;
        $dir = rtrim($u['basedir'], '/\\') . '/' . self::UPLOADS_SUBDIR;
        if (!file_exists($dir)) @mkdir($dir, 0755, true);
        return is_dir($dir) ? $dir : null;
    }

    /** List bundled crib slugs from protocols/shared/crib-templates/. */
    private function bundled_slugs() {
        $dir = SWML_PATH . 'protocols/shared/crib-templates/';
        if (!is_dir($dir)) return [];
        $slugs = [];
        foreach (glob($dir . '*.json') as $path) {
            $slugs[] = basename($path, '.json');
        }
        sort($slugs);
        return $slugs;
    }

    /** Read template_version (int) from a JSON file, or null. */
    private function read_version($path) {
        if (!file_exists($path)) return null;
        $raw = @file_get_contents($path);
        if (!$raw) return null;
        $data = json_decode($raw, true);
        if (!is_array($data)) return null;
        return isset($data['template_version']) ? (int)$data['template_version'] : null;
    }

    /** Render admin page. */
    public function render_page() {
        if (!current_user_can('manage_options')) wp_die('Unauthorized');
        $slugs = $this->bundled_slugs();
        $uploads_dir = $this->uploads_dir();
        $bundled_dir = SWML_PATH . 'protocols/shared/crib-templates/';
        $notice = isset($_GET['swml_notice']) ? sanitize_text_field(wp_unslash($_GET['swml_notice'])) : '';
        ?>
        <div class="wrap">
            <h1>WML Crib Templates</h1>
            <p style="max-width:720px">Upload an updated JSON crib for any text. The override
            replaces the shipping default for that text. Existing student snapshots auto-merge
            on next canvas load — plan + response elements the student has typed into are
            preserved; everything else refreshes to the new template.</p>

            <?php if ($notice): ?>
                <div class="notice notice-info is-dismissible"><p><?php echo esc_html($notice); ?></p></div>
            <?php endif; ?>

            <style>
                .swml-qbank-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 18px; margin-top: 20px; }
                .swml-qbank-card { background: #fff; border: 1px solid #c3c4c7; border-radius: 8px; padding: 18px; }
                .swml-qbank-card h2 { margin: 0 0 6px; font-size: 16px; }
                .swml-qbank-state { color: #555; font-size: 13px; margin-bottom: 10px; }
                .swml-qbank-state.override { color: #135e96; font-weight: 600; }
                .swml-qbank-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
                .swml-qbank-actions form { margin: 0; }
                .swml-qbank-actions input[type="file"] { font-size: 11px; max-width: 180px; }
                .swml-qbank-actions button { font-size: 12px; }
            </style>

            <div class="swml-qbank-grid">
            <?php foreach ($slugs as $slug):
                $bundled_path  = $bundled_dir . $slug . '.json';
                $override_path = $uploads_dir ? ($uploads_dir . '/' . $slug . '.json') : null;
                $bundled_ver   = $this->read_version($bundled_path);
                $override_ver  = $override_path ? $this->read_version($override_path) : null;
                $has_override  = ($override_ver !== null);
                $upload_url    = admin_url('admin-post.php');
                $upload_nonce  = wp_create_nonce('swml_qbank_action_' . $slug);
            ?>
                <div class="swml-qbank-card">
                    <h2><?php echo esc_html($slug); ?></h2>
                    <div class="swml-qbank-state <?php echo $has_override ? 'override' : ''; ?>">
                        <?php if ($has_override): ?>
                            Override active — template_version <?php echo (int)$override_ver; ?>
                            (bundled default: v<?php echo (int)$bundled_ver; ?>)
                        <?php else: ?>
                            Bundled default — template_version <?php echo (int)$bundled_ver; ?>
                        <?php endif; ?>
                    </div>
                    <div class="swml-qbank-actions">
                        <form method="post" action="<?php echo esc_url($upload_url); ?>" enctype="multipart/form-data">
                            <input type="hidden" name="action" value="swml_qbank_upload">
                            <input type="hidden" name="slug" value="<?php echo esc_attr($slug); ?>">
                            <input type="hidden" name="_wpnonce" value="<?php echo esc_attr($upload_nonce); ?>">
                            <input type="file" name="qbank_json" accept=".json,.md,application/json,text/markdown,text/plain" required>
                            <small style="display:block;color:#666;margin-top:2px"><?php echo isset(self::$parser_map[$slug]) ? '.md or .json accepted' : '.json only (no MD parser registered)'; ?></small>
                            <button type="submit" class="button button-primary">Upload</button>
                        </form>
                        <?php if ($has_override): ?>
                            <form method="post" action="<?php echo esc_url($upload_url); ?>" onsubmit="return confirm('Revert <?php echo esc_js($slug); ?> to bundled default? The uploaded JSON will be deleted.');">
                                <input type="hidden" name="action" value="swml_qbank_revert">
                                <input type="hidden" name="slug" value="<?php echo esc_attr($slug); ?>">
                                <input type="hidden" name="_wpnonce" value="<?php echo esc_attr($upload_nonce); ?>">
                                <button type="submit" class="button">Revert</button>
                            </form>
                        <?php endif; ?>
                        <form method="post" action="<?php echo esc_url($upload_url); ?>" onsubmit="return confirm('Force-refresh every existing student snapshot for <?php echo esc_js($slug); ?>? Per-element merge preserves typed plan + response content.');">
                            <input type="hidden" name="action" value="swml_qbank_refresh">
                            <input type="hidden" name="slug" value="<?php echo esc_attr($slug); ?>">
                            <input type="hidden" name="_wpnonce" value="<?php echo esc_attr($upload_nonce); ?>">
                            <button type="submit" class="button">Force-refresh students</button>
                        </form>
                    </div>
                </div>
            <?php endforeach; ?>
            </div>
        </div>
        <?php
    }

    /** Validate slug against bundled-slugs whitelist. */
    private function valid_slug($slug) {
        return in_array($slug, $this->bundled_slugs(), true);
    }

    /** Common entry guard for POST handlers. Returns sanitised slug or wp_die's. */
    private function guard_post() {
        if (!current_user_can('manage_options')) wp_die('Unauthorized', 'WML', 403);
        $slug = isset($_POST['slug']) ? sanitize_key(wp_unslash($_POST['slug'])) : '';
        if (!$this->valid_slug($slug)) wp_die('Unknown slug', 'WML', 400);
        check_admin_referer('swml_qbank_action_' . $slug);
        return $slug;
    }

    /** Redirect back to admin page with a notice param. */
    private function redirect_with_notice($msg) {
        wp_safe_redirect(add_query_arg(['swml_notice' => $msg], admin_url('admin.php?page=sophicly-wml-qbanks')));
        exit;
    }

    /**
     * v7.19.181: locate node binary on the server.
     * Returns absolute path or null. Checks common locations then `command -v`.
     */
    private function find_node_binary() {
        $candidates = [
            '/usr/bin/node',
            '/usr/local/bin/node',
            '/opt/homebrew/bin/node',
            '/home/runcloud/.nvm/versions/node/current/bin/node',
        ];
        foreach ($candidates as $p) if (is_executable($p)) return $p;
        if (function_exists('shell_exec')) {
            $which = @shell_exec('command -v node 2>/dev/null');
            if (is_string($which)) {
                $which = trim($which);
                if ($which && is_executable($which)) return $which;
            }
        }
        return null;
    }

    /**
     * v7.19.181: parse uploaded MD via the matching Node converter script.
     * Returns raw JSON string on success, or redirects with notice on failure.
     */
    private function parse_md_via_node($slug, $tmp_md_path) {
        if (!isset(self::$parser_map[$slug])) {
            $this->redirect_with_notice('MD upload not supported for ' . $slug . ' (no parser registered). Upload pre-converted JSON instead.');
        }
        if (!function_exists('shell_exec')) {
            $this->redirect_with_notice('MD upload requires shell_exec on the server. Upload pre-converted JSON instead.');
        }
        $node = $this->find_node_binary();
        if (!$node) {
            $this->redirect_with_notice('MD upload requires Node on the server. Upload pre-converted JSON instead.');
        }
        $route  = self::$parser_map[$slug];
        $script = SWML_PATH . 'tools/' . $route['script'];
        if (!file_exists($script)) {
            $this->redirect_with_notice('MD parser script missing: ' . $route['script']);
        }

        if ($route['mode'] === 'file_out') {
            $tmp_json = $tmp_md_path . '.json';
            $cmd = escapeshellcmd($node) . ' ' . escapeshellarg($script) . ' ' . escapeshellarg($tmp_md_path) . ' ' . escapeshellarg($tmp_json) . ' 2>&1';
            $log = @shell_exec($cmd);
            $raw = file_exists($tmp_json) ? @file_get_contents($tmp_json) : '';
            if (file_exists($tmp_json)) @unlink($tmp_json);
            if (!$raw) {
                $excerpt = is_string($log) ? mb_substr(trim($log), 0, 200) : '';
                $this->redirect_with_notice('MD parse failed: ' . ($excerpt ?: 'empty output from parser'));
            }
            return $raw;
        }

        // stdout mode
        $cmd = escapeshellcmd($node) . ' ' . escapeshellarg($script) . ' ' . escapeshellarg($tmp_md_path);
        $raw = @shell_exec($cmd);
        if (!is_string($raw) || trim($raw) === '') {
            $this->redirect_with_notice('MD parse failed — Node returned empty output.');
        }
        return $raw;
    }

    public function handle_upload() {
        $slug = $this->guard_post();
        if (empty($_FILES['qbank_json']['tmp_name'])) $this->redirect_with_notice('Upload failed — no file received.');
        if (!empty($_FILES['qbank_json']['error'])) $this->redirect_with_notice('Upload failed — error code ' . (int)$_FILES['qbank_json']['error']);
        if ((int)$_FILES['qbank_json']['size'] > self::MAX_UPLOAD_BYTES) $this->redirect_with_notice('Upload failed — file too large (>1 MB).');

        $tmp = $_FILES['qbank_json']['tmp_name'];
        $orig_name = isset($_FILES['qbank_json']['name']) ? (string)$_FILES['qbank_json']['name'] : '';
        $ext = strtolower(pathinfo($orig_name, PATHINFO_EXTENSION));

        if ($ext === 'md') {
            // Copy upload to a stable tmp path with .md suffix so the Node parser can read it.
            $tmp_md = wp_tempnam('qbank-md-' . $slug . '.md');
            // wp_tempnam may not preserve extension; rename for safety.
            $tmp_md_md = $tmp_md . '.md';
            if (!@rename($tmp_md, $tmp_md_md)) $tmp_md_md = $tmp_md; // fall back
            if (!@move_uploaded_file($tmp, $tmp_md_md) && !@copy($tmp, $tmp_md_md)) {
                $this->redirect_with_notice('Upload failed — could not stage MD file for parsing.');
            }
            $raw = $this->parse_md_via_node($slug, $tmp_md_md);
            @unlink($tmp_md_md);
        } else {
            $raw = @file_get_contents($tmp);
            if (!$raw) $this->redirect_with_notice('Upload failed — could not read uploaded file.');
        }

        $data = json_decode($raw, true);
        if (!is_array($data) || empty($data['html']) || !is_string($data['html'])) {
            $this->redirect_with_notice('Upload failed — ' . ($ext === 'md' ? 'parsed JSON' : 'JSON') . ' missing valid `html` field.');
        }

        // Auto-bump template_version above bundled + uploaded current values.
        $bundled_path  = SWML_PATH . 'protocols/shared/crib-templates/' . $slug . '.json';
        $uploads_dir   = $this->uploads_dir();
        if (!$uploads_dir) $this->redirect_with_notice('Upload failed — uploads dir unavailable.');
        $override_path = $uploads_dir . '/' . $slug . '.json';
        $bundled_ver   = (int)$this->read_version($bundled_path);
        $existing_ver  = (int)$this->read_version($override_path);
        $uploaded_ver  = isset($data['template_version']) ? (int)$data['template_version'] : 0;
        $next_ver      = max($bundled_ver, $existing_ver, $uploaded_ver) + 1;
        $data['template_version'] = $next_ver;

        $written = @file_put_contents($override_path, wp_json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        if ($written === false) $this->redirect_with_notice('Upload failed — could not write override.');

        error_log(sprintf('SWML_QBANK_UPLOAD: %s by user %d → template_version %d', $slug, get_current_user_id(), $next_ver));
        $this->redirect_with_notice(sprintf('Uploaded %s — now at template_version %d. Existing student snapshots auto-merge on next load.', $slug, $next_ver));
    }

    public function handle_revert() {
        $slug = $this->guard_post();
        $uploads_dir = $this->uploads_dir();
        if (!$uploads_dir) $this->redirect_with_notice('Revert failed — uploads dir unavailable.');
        $override_path = $uploads_dir . '/' . $slug . '.json';
        if (!file_exists($override_path)) $this->redirect_with_notice('Revert skipped — no override file to delete.');
        if (!@unlink($override_path)) $this->redirect_with_notice('Revert failed — could not delete override file.');
        error_log(sprintf('SWML_QBANK_REVERT: %s by user %d', $slug, get_current_user_id()));
        $this->redirect_with_notice(sprintf('Reverted %s to bundled default.', $slug));
    }

    /**
     * Force-refresh every existing student snapshot for the given slug.
     * Batch loads user_meta rows matching the slug, runs the same merge logic
     * as on-load, bumps _template_version, re-persists. Reuses Phase A's
     * extended merge_student_responses_into_template().
     */
    public function handle_refresh() {
        global $wpdb;
        $slug = $this->guard_post();

        // Resolve the current canonical template (uploads-override aware).
        $crib_data = SWML_REST_API::resolve_crib_template($slug, '');
        if (!is_array($crib_data) || empty($crib_data['html'])) {
            $this->redirect_with_notice(sprintf('Refresh failed — could not resolve template for %s.', $slug));
        }
        $new_html = $crib_data['html'];
        $disk_ver = isset($crib_data['template_version']) ? (int)$crib_data['template_version'] : 1;

        // user_meta keys look like swml_canvas_aqa_{slug}__crib + optional topic/attempt suffix.
        $like = $wpdb->esc_like('swml_canvas_') . '%' . $wpdb->esc_like('_' . $slug . '__crib') . '%';
        $rows = $wpdb->get_results($wpdb->prepare(
            "SELECT umeta_id, user_id, meta_key, meta_value FROM {$wpdb->usermeta} WHERE meta_key LIKE %s",
            $like
        ));
        $touched = 0;
        $skipped = 0;
        $errors  = 0;
        foreach ($rows as $row) {
            $raw = is_string($row->meta_value) ? $row->meta_value : '';
            $raw = wp_unslash($raw);
            $doc = json_decode($raw, true);
            if (!is_array($doc) || empty($doc['html'])) { $skipped++; continue; }
            $saved_ver = isset($doc['_template_version']) ? (int)$doc['_template_version'] : 0;
            if ($saved_ver >= $disk_ver) { $skipped++; continue; }
            $merged = SWML_REST_API::run_template_merge($new_html, $doc['html']);
            if (!is_string($merged) || $merged === '') { $errors++; continue; }
            $doc['html'] = $merged;
            $doc['_template_version'] = $disk_ver;
            $payload = wp_slash(wp_json_encode($doc, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
            $ok = update_user_meta($row->user_id, $row->meta_key, $payload);
            if ($ok === false) { $errors++; continue; }
            $touched++;
        }
        error_log(sprintf('SWML_QBANK_REFRESH: %s by user %d → touched=%d skipped=%d errors=%d', $slug, get_current_user_id(), $touched, $skipped, $errors));
        $this->redirect_with_notice(sprintf('Force-refresh %s: %d snapshot(s) merged, %d skipped (already current), %d error(s).', $slug, $touched, $skipped, $errors));
    }
}
