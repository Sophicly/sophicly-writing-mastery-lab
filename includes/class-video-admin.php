<?php
/**
 * WML Video Playlist Admin
 * Simple admin interface for managing Bunny Stream video playlists
 * 
 * @package Sophicly_Writing_Mastery_Lab
 * @version 1.0.0
 */

if (!defined('ABSPATH')) exit;

class SWML_Video_Admin {

    private static $instance = null;

    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('admin_menu', [$this, 'add_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('wp_ajax_swml_save_playlists', [$this, 'ajax_save_playlists']);
    }

    public function add_menu() {
        // Use Sophicly hub if available, fall back to Settings
        $parent = class_exists('Sophicly_Admin_Hub') ? 'sophicly' : 'options-general.php';
        add_submenu_page(
            $parent,
            'WML Video Playlists',
            'WML Videos',
            'manage_options',
            'sophicly-wml-videos',
            [$this, 'render_page']
        );
    }

    public function register_settings() {
        register_setting('swml_video_settings', 'swml_video_playlists');
        register_setting('swml_video_settings', 'swml_video_assignments');
    }

    /**
     * AJAX handler to save playlists
     */
    public function ajax_save_playlists() {
        check_ajax_referer('swml_video_nonce', 'nonce');
        if (!current_user_can('manage_options')) wp_die('Unauthorized');

        $playlists = json_decode(stripslashes($_POST['playlists'] ?? '[]'), true);
        $assignments = json_decode(stripslashes($_POST['assignments'] ?? '[]'), true);

        // Sanitize playlists
        $clean_playlists = [];
        foreach ($playlists as $pl) {
            $id = sanitize_key($pl['id'] ?? uniqid('pl_'));
            $clean = [
                'id'    => $id,
                'name'  => sanitize_text_field($pl['name'] ?? ''),
                'videos' => [],
            ];
            foreach (($pl['videos'] ?? []) as $v) {
                $clean['videos'][] = [
                    'title'    => sanitize_text_field($v['title'] ?? ''),
                    'hls'      => esc_url_raw($v['hls'] ?? ''),
                    'thumbnail' => esc_url_raw($v['thumbnail'] ?? ''),
                    'poster'   => esc_url_raw($v['poster'] ?? $v['thumbnail'] ?? ''),
                    'duration' => sanitize_text_field($v['duration'] ?? ''),
                ];
            }
            $clean_playlists[$id] = $clean;
        }

        // Sanitize assignments
        $clean_assignments = [];
        foreach ($assignments as $a) {
            $clean_assignments[] = [
                'playlist_id' => sanitize_key($a['playlist_id'] ?? ''),
                'scope'       => sanitize_text_field($a['scope'] ?? 'global'),
                'task'        => sanitize_text_field($a['task'] ?? ''),
                'subject'     => sanitize_text_field($a['subject'] ?? ''),
                'step'        => absint($a['step'] ?? 0),
            ];
        }

        update_option('swml_video_playlists', $clean_playlists);
        update_option('swml_video_assignments', $clean_assignments);

        // Rebuild the video map for the REST endpoint
        $this->rebuild_video_map($clean_playlists, $clean_assignments);

        wp_send_json_success(['message' => 'Saved']);
    }

    /**
     * Rebuild the swml_video_map option from playlists + assignments
     */
    private function rebuild_video_map($playlists, $assignments) {
        $map = [];

        foreach ($assignments as $a) {
            $pl = $playlists[$a['playlist_id']] ?? null;
            if (!$pl || empty($pl['videos'])) continue;

            $scope = $a['scope'];
            $task = $a['task'];
            $subject = $a['subject'];
            $step = $a['step'];

            if ($scope === 'global') {
                if (!isset($map['global'])) $map['global'] = [];
                $map['global'] = array_merge($map['global'], $pl['videos']);
            } elseif ($scope === 'task') {
                $key = $step > 0 ? "step_{$step}" : 'general';
                if (!isset($map[$task][$key])) $map[$task][$key] = [];
                $map[$task][$key] = array_merge($map[$task][$key], $pl['videos']);
            } elseif ($scope === 'subject') {
                if (!isset($map[$subject]['general'])) $map[$subject]['general'] = [];
                $map[$subject]['general'] = array_merge($map[$subject]['general'], $pl['videos']);
            } elseif ($scope === 'task_subject') {
                $key = $step > 0 ? "step_{$step}" : 'general';
                $compound = "{$task}_{$subject}";
                if (!isset($map[$compound][$key])) $map[$compound][$key] = [];
                $map[$compound][$key] = array_merge($map[$compound][$key], $pl['videos']);
            }
        }

        update_option('swml_video_map', $map);
    }

    /**
     * Render admin page
     */
    public function render_page() {
        $playlists = get_option('swml_video_playlists', []);
        $assignments = get_option('swml_video_assignments', []);
        $nonce = wp_create_nonce('swml_video_nonce');
        ?>
        <style>
            .swml-va { max-width: 960px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            .swml-va h1 { font-size: 22px; margin-bottom: 4px; }
            .swml-va .desc { color: #666; margin-bottom: 20px; }
            .swml-va-tabs { display: flex; gap: 0; border-bottom: 2px solid #e0e0e0; margin-bottom: 20px; }
            .swml-va-tab { padding: 8px 20px; cursor: pointer; font-weight: 600; color: #666; border-bottom: 2px solid transparent; margin-bottom: -2px; }
            .swml-va-tab.active { color: #5333ed; border-bottom-color: #5333ed; }
            .swml-va-panel { display: none; }
            .swml-va-panel.active { display: block; }
            .swml-va-card { background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
            .swml-va-card h3 { margin: 0 0 12px; font-size: 15px; display: flex; justify-content: space-between; align-items: center; }
            .swml-va-card h3 input { font-size: 15px; font-weight: 600; border: 1px solid #ddd; border-radius: 4px; padding: 4px 8px; flex: 1; margin-right: 8px; }
            .swml-va-video { display: flex; gap: 8px; align-items: center; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
            .swml-va-video:last-child { border-bottom: none; }
            .swml-va-video input { border: 1px solid #ddd; border-radius: 4px; padding: 4px 8px; font-size: 13px; }
            .swml-va-video input.title { flex: 2; }
            .swml-va-video input.hls { flex: 3; font-family: monospace; font-size: 11px; }
            .swml-va-video input.thumb { flex: 2; font-family: monospace; font-size: 11px; }
            .swml-va-video input.dur { width: 60px; }
            .swml-va-btn { padding: 6px 14px; border-radius: 6px; border: 1px solid #ddd; background: #fff; cursor: pointer; font-size: 12px; }
            .swml-va-btn:hover { background: #f5f5f5; }
            .swml-va-btn.primary { background: #5333ed; color: #fff; border-color: #5333ed; }
            .swml-va-btn.primary:hover { background: #4025d0; }
            .swml-va-btn.danger { color: #e53e3e; border-color: #e53e3e; }
            .swml-va-btn.danger:hover { background: #fff5f5; }
            .swml-va-btn.small { padding: 3px 8px; font-size: 11px; }
            .swml-va-add { margin-top: 8px; }
            .swml-va-assign { display: flex; gap: 8px; align-items: center; padding: 8px 0; border-bottom: 1px solid #f0f0f0; flex-wrap: wrap; }
            .swml-va-assign select { padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 13px; }
            .swml-va-save-bar { position: sticky; bottom: 0; background: #fff; padding: 12px 0; border-top: 2px solid #e0e0e0; margin-top: 20px; display: flex; gap: 10px; align-items: center; }
            .swml-va-status { font-size: 13px; color: #51dacf; font-weight: 600; display: none; }
        </style>

        <div class="wrap swml-va">
            <h1>📚 WML Video Playlists</h1>
            <p class="desc">Manage Bunny Stream video playlists and assign them to tasks, subjects, and steps.</p>

            <div class="swml-va-tabs">
                <div class="swml-va-tab active" data-tab="playlists">Playlists</div>
                <div class="swml-va-tab" data-tab="assignments">Where They Show</div>
            </div>

            <div class="swml-va-panel active" data-panel="playlists" id="swml-playlists"></div>
            <div class="swml-va-panel" data-panel="assignments" id="swml-assignments"></div>

            <div class="swml-va-save-bar">
                <button class="swml-va-btn primary" id="swml-save-all">💾 Save All Changes</button>
                <span class="swml-va-status" id="swml-status">✓ Saved</span>
            </div>
        </div>

        <script>
        (function() {
            const nonce = '<?php echo $nonce; ?>';
            const ajaxUrl = '<?php echo admin_url("admin-ajax.php"); ?>';
            let playlists = <?php echo json_encode(array_values($playlists)); ?>;
            let assignments = <?php echo json_encode(array_values($assignments)); ?>;

            const tasks = [
                {id: '', label: '— Any task —'},
                {id: 'feedback_discussion', label: 'Discuss Feedback'},
                {id: 'planning', label: 'Planning'},
                {id: 'assessment', label: 'Assessment'},
                {id: 'polishing', label: 'Polishing'},
                {id: 'exam_prep', label: 'Exam Preparation'},
                {id: 'creative_writing', label: 'Creative Writing'},
                {id: 'mark_scheme', label: 'Mark Scheme'},
                {id: 'model_answer', label: 'Model Answer'},
            ];
            const subjects = [
                {id: '', label: '— Any subject —'},
                {id: 'shakespeare', label: 'Shakespeare'},
                {id: 'modern_text', label: 'Modern Text'},
                {id: '19th_century', label: '19th Century Novel'},
                {id: 'poetry_anthology', label: 'Poetry Anthology'},
                {id: 'unseen_poetry', label: 'Unseen Poetry'},
                {id: 'language1', label: 'Language Paper 1'},
                {id: 'language2', label: 'Language Paper 2'},
            ];
            const scopes = [
                {id: 'global', label: 'Everywhere'},
                {id: 'task', label: 'Specific task'},
                {id: 'subject', label: 'Specific subject'},
                {id: 'task_subject', label: 'Task + subject'},
            ];

            // Tab switching
            document.querySelectorAll('.swml-va-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.swml-va-tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.swml-va-panel').forEach(p => p.classList.remove('active'));
                    tab.classList.add('active');
                    document.querySelector(`[data-panel="${tab.dataset.tab}"]`).classList.add('active');
                });
            });

            function renderPlaylists() {
                const container = document.getElementById('swml-playlists');
                container.innerHTML = '';

                playlists.forEach((pl, pi) => {
                    const card = document.createElement('div');
                    card.className = 'swml-va-card';
                    card.innerHTML = `
                        <h3>
                            <input type="text" value="${esc(pl.name)}" class="pl-name" data-pi="${pi}" placeholder="Playlist name...">
                            <button class="swml-va-btn danger small del-pl" data-pi="${pi}">Delete</button>
                        </h3>
                        <div class="pl-videos" data-pi="${pi}">
                            ${(pl.videos || []).map((v, vi) => videoRow(pi, vi, v)).join('')}
                        </div>
                        <button class="swml-va-btn small swml-va-add add-video" data-pi="${pi}">+ Add Video</button>
                    `;
                    container.appendChild(card);
                });

                container.innerHTML += '<button class="swml-va-btn" id="add-playlist">+ New Playlist</button>';

                // Events
                container.querySelectorAll('.pl-name').forEach(el => el.addEventListener('input', e => {
                    playlists[e.target.dataset.pi].name = e.target.value;
                }));
                container.querySelectorAll('.del-pl').forEach(el => el.addEventListener('click', e => {
                    if (confirm('Delete this playlist?')) { playlists.splice(e.target.dataset.pi, 1); renderPlaylists(); }
                }));
                container.querySelectorAll('.add-video').forEach(el => el.addEventListener('click', e => {
                    const pi = e.target.dataset.pi;
                    if (!playlists[pi].videos) playlists[pi].videos = [];
                    playlists[pi].videos.push({ title: '', hls: '', duration: '' });
                    renderPlaylists();
                }));
                container.querySelectorAll('.vid-title, .vid-hls, .vid-dur, .vid-thumb').forEach(el => el.addEventListener('input', e => {
                    const { pi, vi } = e.target.dataset;
                    const field = e.target.classList.contains('vid-title') ? 'title' : e.target.classList.contains('vid-hls') ? 'hls' : e.target.classList.contains('vid-thumb') ? 'thumbnail' : 'duration';
                    playlists[pi].videos[vi][field] = e.target.value;
                }));
                container.querySelectorAll('.del-vid').forEach(el => el.addEventListener('click', e => {
                    const { pi, vi } = e.target.dataset;
                    playlists[pi].videos.splice(vi, 1);
                    renderPlaylists();
                }));
                document.getElementById('add-playlist')?.addEventListener('click', () => {
                    playlists.push({ id: 'pl_' + Date.now(), name: 'New Playlist', videos: [] });
                    renderPlaylists();
                });
            }

            function videoRow(pi, vi, v) {
                return `<div class="swml-va-video">
                    <span style="color:#999;font-size:11px;width:20px">${vi + 1}.</span>
                    <input class="title vid-title" data-pi="${pi}" data-vi="${vi}" value="${esc(v.title)}" placeholder="Video title">
                    <input class="hls vid-hls" data-pi="${pi}" data-vi="${vi}" value="${esc(v.hls)}" placeholder="HLS URL (https://vz-xxx.b-cdn.net/.../playlist.m3u8)">
                    <input class="thumb vid-thumb" data-pi="${pi}" data-vi="${vi}" value="${esc(v.thumbnail || '')}" placeholder="Thumbnail URL">
                    <input class="dur vid-dur" data-pi="${pi}" data-vi="${vi}" value="${esc(v.duration)}" placeholder="5:30">
                    <button class="swml-va-btn danger small del-vid" data-pi="${pi}" data-vi="${vi}">×</button>
                </div>`;
            }

            function renderAssignments() {
                const container = document.getElementById('swml-assignments');
                container.innerHTML = '<p style="color:#666;font-size:13px;margin-bottom:12px;">Each assignment puts a playlist in a specific place. A playlist can be assigned to multiple places.</p>';

                assignments.forEach((a, ai) => {
                    const row = document.createElement('div');
                    row.className = 'swml-va-assign';
                    row.innerHTML = `
                        <select class="assign-pl" data-ai="${ai}">
                            <option value="">— Select playlist —</option>
                            ${playlists.map(pl => `<option value="${pl.id}" ${a.playlist_id === pl.id ? 'selected' : ''}>${esc(pl.name || pl.id)}</option>`).join('')}
                        </select>
                        <span style="color:#999">shows</span>
                        <select class="assign-scope" data-ai="${ai}">
                            ${scopes.map(s => `<option value="${s.id}" ${a.scope === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
                        </select>
                        <select class="assign-task" data-ai="${ai}" ${['task','task_subject'].includes(a.scope) ? '' : 'style="display:none"'}>
                            ${tasks.map(t => `<option value="${t.id}" ${a.task === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}
                        </select>
                        <select class="assign-subject" data-ai="${ai}" ${['subject','task_subject'].includes(a.scope) ? '' : 'style="display:none"'}>
                            ${subjects.map(s => `<option value="${s.id}" ${a.subject === s.id ? 'selected' : ''}>${s.label}</option>`).join('')}
                        </select>
                        <select class="assign-step" data-ai="${ai}" ${['task','task_subject'].includes(a.scope) ? '' : 'style="display:none"'}>
                            <option value="0" ${(a.step || 0) == 0 ? 'selected' : ''}>All sections</option>
                            <option value="1" ${a.step == 1 ? 'selected' : ''}>1 — Setup & Goals</option>
                            <option value="2" ${a.step == 2 ? 'selected' : ''}>2 — Keyword Analysis</option>
                            <option value="3" ${a.step == 3 ? 'selected' : ''}>3 — Anchor Quotes</option>
                            <option value="4" ${a.step == 4 ? 'selected' : ''}>4 — Body Paragraph 1</option>
                            <option value="5" ${a.step == 5 ? 'selected' : ''}>5 — Body Paragraph 2</option>
                            <option value="6" ${a.step == 6 ? 'selected' : ''}>6 — Body Paragraph 3</option>
                            <option value="7" ${a.step == 7 ? 'selected' : ''}>7 — Introduction</option>
                            <option value="8" ${a.step == 8 ? 'selected' : ''}>8 — Conclusion</option>
                        </select>
                        <button class="swml-va-btn danger small del-assign" data-ai="${ai}">×</button>
                    `;
                    container.appendChild(row);
                });

                container.innerHTML += '<button class="swml-va-btn" id="add-assign">+ Add Assignment</button>';

                // Events
                container.querySelectorAll('.assign-pl').forEach(el => el.addEventListener('change', e => {
                    assignments[e.target.dataset.ai].playlist_id = e.target.value;
                }));
                container.querySelectorAll('.assign-scope').forEach(el => el.addEventListener('change', e => {
                    const ai = e.target.dataset.ai;
                    assignments[ai].scope = e.target.value;
                    renderAssignments();
                }));
                container.querySelectorAll('.assign-task').forEach(el => el.addEventListener('change', e => {
                    assignments[e.target.dataset.ai].task = e.target.value;
                }));
                container.querySelectorAll('.assign-subject').forEach(el => el.addEventListener('change', e => {
                    assignments[e.target.dataset.ai].subject = e.target.value;
                }));
                container.querySelectorAll('.assign-step').forEach(el => el.addEventListener('change', e => {
                    assignments[e.target.dataset.ai].step = parseInt(e.target.value) || 0;
                }));
                container.querySelectorAll('.del-assign').forEach(el => el.addEventListener('click', e => {
                    assignments.splice(e.target.dataset.ai, 1);
                    renderAssignments();
                }));
                document.getElementById('add-assign')?.addEventListener('click', () => {
                    assignments.push({ playlist_id: '', scope: 'global', task: '', subject: '', step: 0 });
                    renderAssignments();
                });
            }

            function esc(s) { return (s || '').replace(/"/g, '&quot;').replace(/</g, '&lt;'); }

            // Save
            document.getElementById('swml-save-all').addEventListener('click', () => {
                const btn = document.getElementById('swml-save-all');
                btn.disabled = true; btn.textContent = 'Saving...';

                const fd = new FormData();
                fd.append('action', 'swml_save_playlists');
                fd.append('nonce', nonce);
                fd.append('playlists', JSON.stringify(playlists));
                fd.append('assignments', JSON.stringify(assignments));

                fetch(ajaxUrl, { method: 'POST', body: fd })
                    .then(r => r.json())
                    .then(res => {
                        btn.disabled = false; btn.textContent = '💾 Save All Changes';
                        const status = document.getElementById('swml-status');
                        status.style.display = 'inline';
                        status.textContent = res.success ? '✓ Saved' : '✗ Error saving';
                        setTimeout(() => status.style.display = 'none', 3000);
                    })
                    .catch(() => {
                        btn.disabled = false; btn.textContent = '💾 Save All Changes';
                    });
            });

            renderPlaylists();
            renderAssignments();
        })();
        </script>
        <?php
    }
}
