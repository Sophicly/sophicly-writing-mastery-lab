<?php
/**
 * SWML Feedback Unlock (v7.15.76)
 *
 * Permission-gated unlock of feedback sections in the assessment canvas so
 * students with prior (legacy) feedback can paste it into the matching rows.
 *
 * Storage (per student, user_meta):
 *   - swml_feedback_unlocked              '1' or '' — global unlock across all topics
 *   - swml_feedback_unlocked_topics       JSON array of { board, text, topic } triples
 *
 * Effective-unlock = global OR triple in list. Always gated by viewerMode==='edit'
 * on the JS side so tutors/parents viewing never get edit access to feedback rows
 * regardless of the flag.
 *
 * Manage permission: admin OR sophicly_att_role='tutor' OR
 * sophicly_att_role='specialist' OR sophicly_role='sss'. Never parents. Never
 * students self-managing their own unlock.
 */

if (!defined('ABSPATH')) exit;

class SWML_Feedback_Unlock {

    const META_GLOBAL = 'swml_feedback_unlocked';
    const META_TOPICS = 'swml_feedback_unlocked_topics';

    private static $instance = null;

    public static function instance() {
        if (null === self::$instance) self::$instance = new self();
        return self::$instance;
    }

    private function __construct() {
        add_action('rest_api_init', [$this, 'register_routes']);
        add_action('show_user_profile', [$this, 'render_profile_section']);
        add_action('edit_user_profile', [$this, 'render_profile_section']);
        add_action('personal_options_update', [$this, 'save_profile_section']);
        add_action('edit_user_profile_update', [$this, 'save_profile_section']);
    }

    // ── Helpers ──

    public static function is_global_unlocked($user_id) {
        $v = get_user_meta((int) $user_id, self::META_GLOBAL, true);
        return $v === '1' || $v === 1 || $v === true;
    }

    public static function get_unlocked_topics($user_id) {
        $raw = get_user_meta((int) $user_id, self::META_TOPICS, true);
        if (empty($raw)) return [];
        $list = is_array($raw) ? $raw : json_decode($raw, true);
        if (!is_array($list)) return [];
        $out = [];
        foreach ($list as $t) {
            if (!is_array($t)) continue;
            $board = isset($t['board']) ? sanitize_text_field($t['board']) : '';
            $text  = isset($t['text'])  ? sanitize_text_field($t['text'])  : '';
            $topic = isset($t['topic']) ? (int) $t['topic'] : 0;
            if ($board && $text && $topic) {
                $out[] = ['board' => $board, 'text' => $text, 'topic' => $topic];
            }
        }
        return $out;
    }

    public static function is_unlocked_for_topic($user_id, $board, $text, $topic) {
        if (self::is_global_unlocked($user_id)) return true;
        $topic = (int) $topic;
        foreach (self::get_unlocked_topics($user_id) as $t) {
            if ($t['board'] === $board && $t['text'] === $text && $t['topic'] === $topic) {
                return true;
            }
        }
        return false;
    }

    /**
     * Who may view/edit unlocks for a student. Admin, tutor, specialist/SSS.
     */
    public static function can_manage_unlocks($viewer_id = null) {
        $uid = $viewer_id ? (int) $viewer_id : get_current_user_id();
        if (!$uid) return false;
        if (user_can($uid, 'manage_options')) return true;
        $att_role  = get_user_meta($uid, 'sophicly_att_role', true);
        $soph_role = get_user_meta($uid, 'sophicly_role', true);
        if ($att_role === 'tutor') return true;
        if ($att_role === 'specialist' || $soph_role === 'sss') return true;
        return false;
    }

    // ── REST routes ──

    public function register_routes() {
        $ns = 'sophicly-wml/v1';

        register_rest_route($ns, '/students/(?P<uid>\d+)/feedback-unlock', [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'rest_get'],
                'permission_callback' => [$this, 'rest_permission'],
            ],
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'rest_set_global'],
                'permission_callback' => [$this, 'rest_permission'],
            ],
        ]);

        register_rest_route($ns, '/students/(?P<uid>\d+)/feedback-unlock-topic', [
            'methods'             => 'POST',
            'callback'            => [$this, 'rest_set_topic'],
            'permission_callback' => [$this, 'rest_permission'],
        ]);
    }

    public function rest_permission() {
        return self::can_manage_unlocks();
    }

    public function rest_get($request) {
        $uid = (int) $request['uid'];
        if (!$uid || !get_userdata($uid)) {
            return new WP_Error('invalid_user', 'User not found', ['status' => 404]);
        }
        return rest_ensure_response([
            'success' => true,
            'user_id' => $uid,
            'global'  => self::is_global_unlocked($uid),
            'topics'  => self::get_unlocked_topics($uid),
        ]);
    }

    public function rest_set_global($request) {
        $uid = (int) $request['uid'];
        if (!$uid || !get_userdata($uid)) {
            return new WP_Error('invalid_user', 'User not found', ['status' => 404]);
        }
        $params   = $request->get_json_params();
        $unlocked = !empty($params['unlocked']);
        update_user_meta($uid, self::META_GLOBAL, $unlocked ? '1' : '');
        return rest_ensure_response([
            'success' => true,
            'user_id' => $uid,
            'global'  => $unlocked,
        ]);
    }

    public function rest_set_topic($request) {
        $uid = (int) $request['uid'];
        if (!$uid || !get_userdata($uid)) {
            return new WP_Error('invalid_user', 'User not found', ['status' => 404]);
        }
        $params   = $request->get_json_params();
        $board    = isset($params['board']) ? sanitize_text_field($params['board']) : '';
        $text     = isset($params['text'])  ? sanitize_text_field($params['text'])  : '';
        $topic    = isset($params['topic']) ? (int) $params['topic'] : 0;
        $unlocked = !empty($params['unlocked']);

        if (!$board || !$text || $topic < 1) {
            return new WP_Error('missing_params', 'board, text, topic required', ['status' => 400]);
        }

        $topics = self::get_unlocked_topics($uid);
        $idx = -1;
        foreach ($topics as $i => $t) {
            if ($t['board'] === $board && $t['text'] === $text && $t['topic'] === $topic) {
                $idx = $i;
                break;
            }
        }
        if ($unlocked && $idx === -1) {
            $topics[] = ['board' => $board, 'text' => $text, 'topic' => $topic];
        } elseif (!$unlocked && $idx !== -1) {
            array_splice($topics, $idx, 1);
        }
        update_user_meta($uid, self::META_TOPICS, wp_slash(wp_json_encode(array_values($topics))));
        return rest_ensure_response([
            'success' => true,
            'user_id' => $uid,
            'topics'  => $topics,
        ]);
    }

    // ── WP admin profile screen ──

    public function render_profile_section($user) {
        if (!self::can_manage_unlocks()) return;
        $target_uid = isset($user->ID) ? (int) $user->ID : 0;
        if (!$target_uid) return;
        $global = self::is_global_unlocked($target_uid);
        $topics = self::get_unlocked_topics($target_uid);
        wp_nonce_field('swml_feedback_unlock_save', 'swml_feedback_unlock_nonce');
        ?>
        <h2>Sophicly — Feedback Section Access</h2>
        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="swml_feedback_unlocked">Unlock feedback editing</label>
                </th>
                <td>
                    <label>
                        <input type="checkbox" id="swml_feedback_unlocked" name="swml_feedback_unlocked" value="1" <?php checked($global); ?> />
                        Allow this student to type/paste into Feedback sections (all topics).
                    </label>
                    <p class="description">When off, feedback rows stay read-only. Tutors and parents viewing this student always see feedback read-only regardless of this setting.</p>
                </td>
            </tr>
            <?php if (!empty($topics)): ?>
            <tr>
                <th scope="row">Per-topic unlocks</th>
                <td>
                    <ul style="margin:0;">
                        <?php foreach ($topics as $t): ?>
                            <li><code><?php echo esc_html($t['board']); ?> / <?php echo esc_html($t['text']); ?> / topic <?php echo (int) $t['topic']; ?></code></li>
                        <?php endforeach; ?>
                    </ul>
                    <p class="description">Per-topic unlocks are managed from the Attendance Tracker and Dashboard interfaces. Listed here for reference only.</p>
                </td>
            </tr>
            <?php endif; ?>
        </table>
        <?php
    }

    public function save_profile_section($user_id) {
        if (!self::can_manage_unlocks()) return;
        if (empty($_POST['swml_feedback_unlock_nonce']) ||
            !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['swml_feedback_unlock_nonce'])), 'swml_feedback_unlock_save')) {
            return;
        }
        $unlocked = !empty($_POST['swml_feedback_unlocked']);
        update_user_meta((int) $user_id, self::META_GLOBAL, $unlocked ? '1' : '');
    }
}

SWML_Feedback_Unlock::instance();
