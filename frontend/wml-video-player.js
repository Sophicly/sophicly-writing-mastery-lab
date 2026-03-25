/**
 * WML Floating Video Player
 * Self-contained HLS player for Bunny Stream with draggable PiP, playlist, resize
 * v1.0.0
 */
(function() {
    'use strict';

    // ── Config ──
    const SIZES = {
        small:  { w: 320 },
        medium: { w: 480 },
        large:  { w: 640 },
    };
    const DEFAULT_SIZE = 'medium';

    let state = {
        open: false,
        size: DEFAULT_SIZE,
        currentIndex: 0,
        playlist: [],
        dragging: false,
        minimised: false,
    };

    let container, video, hlsInstance, playlistDrawer, playlistList, nowPlaying;

    // ── Public API ──
    window.wmlVideo = {
        open(playlist, options) {
            if (!playlist || playlist.length === 0) return;
            state.playlist = playlist;
            state.currentIndex = 0;
            if (!container) buildPlayer();
            // Always reset to default bottom-left position (v7.12.82)
            container.style.position = 'fixed';
            container.style.bottom = '20px';
            container.style.left = '20px';
            container.style.right = 'auto';
            container.style.top = 'auto';
            container.style.display = 'flex';
            state.open = true;
            state.minimised = false;
            // Allow caller to set initial size (e.g. 'large' for feedback canvas)
            if (options?.size && SIZES[options.size]) state.size = options.size;
            applySize();
            // Always show playlist
            if (playlistDrawer) playlistDrawer.style.display = 'block';
            // Resume from saved progress
            try {
                const saved = JSON.parse(localStorage.getItem('wml-video-progress') || '{}');
                if (saved.index < playlist.length) state.currentIndex = saved.index || 0;
            } catch(e) {}
            loadVideo(state.currentIndex);
            renderPlaylist();
        },
        close() {
            saveProgress();
            if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }
            if (video) video.pause();
            if (container) container.style.display = 'none';
            state.open = false;
        },
        isOpen() { return state.open; },
    };

    // ── Build DOM ──
    function buildPlayer() {
        container = document.createElement('div');
        container.className = 'wml-vp';
        container.innerHTML = `
            <div class="wml-vp-header">
                <div class="wml-vp-drag-handle" title="Drag to move">
                    <span class="wml-vp-title">Video Lesson</span>
                </div>
                <div class="wml-vp-controls">
                    <button class="wml-vp-btn" data-action="playlist" title="Playlist">☰</button>
                    <button class="wml-vp-btn" data-action="size" title="Resize">⤢</button>
                    <button class="wml-vp-btn" data-action="dock" title="Dock to corner">⌖</button>
                    <button class="wml-vp-btn" data-action="minimise" title="Minimise">▁</button>
                    <button class="wml-vp-btn" data-action="close" title="Close">×</button>
                </div>
            </div>
            <div class="wml-vp-body">
                <video class="wml-vp-video" playsinline controls></video>
                <div class="wml-vp-now-playing">
                    <span class="wml-vp-np-title"></span>
                    <span class="wml-vp-np-count"></span>
                </div>
                <div class="wml-vp-playlist" style="display:none">
                    <div class="wml-vp-pl-header">Up Next</div>
                    <div class="wml-vp-pl-list"></div>
                </div>
            </div>
            <div class="wml-vp-minimised" style="display:none">
                <span class="wml-vp-mini-title"></span>
                <button class="wml-vp-btn wml-vp-mini-expand" title="Expand">▲</button>
            </div>
        `;

        video = container.querySelector('.wml-vp-video');
        playlistDrawer = container.querySelector('.wml-vp-playlist');
        playlistList = container.querySelector('.wml-vp-pl-list');
        nowPlaying = container.querySelector('.wml-vp-now-playing');

        // Button actions
        container.querySelectorAll('.wml-vp-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = btn.dataset.action;
                if (action === 'close') wmlVideo.close();
                else if (action === 'size') cycleSize();
                else if (action === 'dock') dockToDefault();
                else if (action === 'minimise') toggleMinimise();
                else if (action === 'playlist') togglePlaylist();
            });
        });

        // Expand from minimised
        container.querySelector('.wml-vp-mini-expand')?.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMinimise();
        });
        container.querySelector('.wml-vp-minimised')?.addEventListener('click', toggleMinimise);

        // Video events
        video.addEventListener('ended', () => {
            if (state.currentIndex < state.playlist.length - 1) {
                // Fade transition to next video
                video.style.transition = 'opacity 0.4s ease';
                video.style.opacity = '0.3';
                setTimeout(() => {
                    loadVideo(state.currentIndex + 1);
                    video.style.opacity = '1';
                    setTimeout(() => video.style.transition = '', 400);
                }, 400);
            }
        });
        // Save progress periodically
        video.addEventListener('timeupdate', () => {
            if (Math.floor(video.currentTime) % 5 === 0) saveProgress();
        });
        video.addEventListener('pause', saveProgress);

        // Drag support
        initDrag();

        // Edge/corner resize
        initEdgeResize();

        document.body.appendChild(container);
    }

    function loadVideo(index) {
        if (index < 0 || index >= state.playlist.length) return;
        state.currentIndex = index;
        const item = state.playlist[index];

        // Update title + now-playing bar
        const titleEl = container.querySelector('.wml-vp-title');
        if (titleEl) titleEl.textContent = item.title || `Video ${index + 1}`;
        const miniTitle = container.querySelector('.wml-vp-mini-title');
        if (miniTitle) miniTitle.textContent = item.title || `Video ${index + 1}`;
        if (nowPlaying) {
            nowPlaying.querySelector('.wml-vp-np-title').textContent = item.title || `Video ${index + 1}`;
            nowPlaying.querySelector('.wml-vp-np-count').textContent = `${index + 1} / ${state.playlist.length}`;
        }
        // Update playlist header
        const plHeader = container.querySelector('.wml-vp-pl-header');
        if (plHeader) {
            const nextIdx = index + 1;
            plHeader.textContent = nextIdx < state.playlist.length
                ? `Up Next: ${state.playlist[nextIdx].title || 'Video ' + (nextIdx + 1)}`
                : 'Playlist';
        }

        // Destroy previous HLS instance
        if (hlsInstance) { hlsInstance.destroy(); hlsInstance = null; }

        const src = item.hls || item.src || item.url || '';
        if (!src) { console.warn('WML Video: No source for item', index); return; }

        // Set poster/thumbnail if available
        if (item.poster || item.thumbnail) video.poster = item.poster || item.thumbnail;

        // Resume time from saved progress
        let resumeTime = 0;
        try {
            const saved = JSON.parse(localStorage.getItem('wml-video-progress') || '{}');
            if (saved.index === index && saved.time > 0) resumeTime = saved.time;
        } catch(e) {}

        const startPlayback = () => {
            if (resumeTime > 0) video.currentTime = resumeTime;
            // Try unmuted autoplay first; if blocked, try muted (browser policy)
            video.play().catch(() => {
                video.muted = true;
                video.play().catch(() => {});
            });
        };

        if (src.includes('.m3u8')) {
            if (window.Hls && Hls.isSupported()) {
                hlsInstance = new Hls({ maxBufferLength: 30, maxMaxBufferLength: 60 });
                hlsInstance.loadSource(src);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, startPlayback);
                hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) hlsInstance.startLoad();
                        else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) hlsInstance.recoverMediaError();
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
                video.addEventListener('loadedmetadata', startPlayback, { once: true });
            }
        } else {
            video.src = src;
            video.addEventListener('loadedmetadata', startPlayback, { once: true });
        }

        renderPlaylist();
    }

    function saveProgress() {
        try {
            localStorage.setItem('wml-video-progress', JSON.stringify({
                index: state.currentIndex,
                time: video ? Math.floor(video.currentTime) : 0,
            }));
        } catch(e) {}
    }

    // ── Playlist Drawer ──
    function renderPlaylist() {
        if (!playlistList) return;
        playlistList.innerHTML = '';

        state.playlist.forEach((item, i) => {
            const row = document.createElement('div');
            row.className = `wml-vp-pl-item ${i === state.currentIndex ? 'active' : ''}`;

            // Number
            const num = document.createElement('span');
            num.className = 'wml-vp-pl-num';
            num.textContent = i === state.currentIndex ? '▶' : String(i + 1);
            row.appendChild(num);

            // Thumbnail
            const thumb = item.thumbnail || item.poster || '';
            const thumbWrap = document.createElement('div');
            if (thumb) {
                thumbWrap.className = 'wml-vp-pl-thumb-wrap';
                const img = document.createElement('img');
                img.className = 'wml-vp-pl-thumb';
                img.src = thumb;
                img.alt = '';
                img.loading = 'lazy';
                thumbWrap.appendChild(img);
            } else {
                thumbWrap.className = 'wml-vp-pl-thumb-wrap wml-vp-pl-thumb-placeholder';
                const icon = document.createElement('span');
                icon.className = 'wml-vp-pl-thumb-icon';
                icon.textContent = '▶';
                thumbWrap.appendChild(icon);
            }
            if (item.duration) {
                const dur = document.createElement('span');
                dur.className = 'wml-vp-pl-dur-badge';
                dur.textContent = item.duration;
                thumbWrap.appendChild(dur);
            }
            row.appendChild(thumbWrap);

            // Info
            const info = document.createElement('div');
            info.className = 'wml-vp-pl-info';
            const title = document.createElement('span');
            title.className = 'wml-vp-pl-title';
            title.textContent = item.title || 'Video ' + (i + 1);
            info.appendChild(title);
            if (item.description) {
                const desc = document.createElement('span');
                desc.className = 'wml-vp-pl-desc';
                desc.textContent = item.description;
                info.appendChild(desc);
            }
            row.appendChild(info);

            row.addEventListener('click', () => loadVideo(i));
            playlistList.appendChild(row);
        });

        // Scroll active item into view
        const activeItem = playlistList.querySelector('.wml-vp-pl-item.active');
        if (activeItem) activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    function togglePlaylist() {
        const showing = playlistDrawer.style.display !== 'none';
        playlistDrawer.style.display = showing ? 'none' : 'block';
    }

    // ── Size Cycling ──
    function cycleSize() {
        const sizes = Object.keys(SIZES);
        const idx = sizes.indexOf(state.size);
        state.size = sizes[(idx + 1) % sizes.length];
        applySize();
    }

    function applySize() {
        const s = SIZES[state.size];
        container.style.width = s.w + 'px';
        // Don't set height — let it flex based on content
        container.dataset.size = state.size;
    }

    // ── Minimise ──
    function toggleMinimise() {
        state.minimised = !state.minimised;
        const body = container.querySelector('.wml-vp-body');
        const header = container.querySelector('.wml-vp-header');
        const mini = container.querySelector('.wml-vp-minimised');

        if (state.minimised) {
            body.style.display = 'none';
            header.style.display = 'none';
            mini.style.display = 'flex';
            container.style.width = '200px';
        } else {
            body.style.display = 'block';
            header.style.display = 'flex';
            mini.style.display = 'none';
            applySize();
        }
    }

    function dockToDefault() {
        container.style.transition = 'all 0.3s ease';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.left = '20px';
        container.style.right = 'auto';
        container.style.top = 'auto';
        state.size = DEFAULT_SIZE;
        applySize();
        setTimeout(() => container.style.transition = '', 300);
    }

    // ── Drag ──
    function initDrag() {
        const handle = container.querySelector('.wml-vp-drag-handle');
        if (!handle) return;

        let startX, startY, startLeft, startTop;

        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            state.dragging = true;
            const rect = container.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            startLeft = rect.left;
            startTop = rect.top;

            // Switch to fixed positioning for dragging
            container.style.position = 'fixed';
            container.style.left = startLeft + 'px';
            container.style.top = startTop + 'px';
            container.style.right = 'auto';
            container.style.bottom = 'auto';

            document.body.style.userSelect = 'none';

            const onMove = (ev) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                container.style.left = (startLeft + dx) + 'px';
                container.style.top = (startTop + dy) + 'px';
            };
            const onUp = () => {
                state.dragging = false;
                document.body.style.userSelect = '';
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });

        // Touch support
        handle.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = container.getBoundingClientRect();
            startX = touch.clientX;
            startY = touch.clientY;
            startLeft = rect.left;
            startTop = rect.top;

            container.style.position = 'fixed';
            container.style.left = startLeft + 'px';
            container.style.top = startTop + 'px';
            container.style.right = 'auto';
            container.style.bottom = 'auto';

            const onMove = (ev) => {
                const t = ev.touches[0];
                container.style.left = (startLeft + t.clientX - startX) + 'px';
                container.style.top = (startTop + t.clientY - startY) + 'px';
            };
            const onUp = () => {
                handle.removeEventListener('touchmove', onMove);
                handle.removeEventListener('touchend', onUp);
            };
            handle.addEventListener('touchmove', onMove, { passive: true });
            handle.addEventListener('touchend', onUp);
        }, { passive: true });
    }

    // ── Edge/Corner Resize ──
    function initEdgeResize() {
        // Add resize handles on all edges and corners
        const edges = ['n','s','e','w','ne','nw','se','sw'];
        edges.forEach(dir => {
            const handle = document.createElement('div');
            handle.className = `wml-vp-resize wml-vp-resize-${dir}`;
            handle.addEventListener('mousedown', (e) => {
                e.preventDefault(); e.stopPropagation();
                const rect = container.getBoundingClientRect();
                const startX = e.clientX, startY = e.clientY;
                const startW = rect.width, startH = rect.height;
                const startL = rect.left, startT = rect.top;

                container.style.position = 'fixed';
                container.style.right = 'auto'; container.style.bottom = 'auto';
                container.style.left = startL + 'px'; container.style.top = startT + 'px';
                document.body.style.cursor = getComputedStyle(handle).cursor;
                document.body.style.userSelect = 'none';

                const onMove = (ev) => {
                    const dx = ev.clientX - startX, dy = ev.clientY - startY;
                    let w = startW, h = startH, l = startL, t = startT;

                    if (dir.includes('e')) w = Math.max(260, startW + dx);
                    if (dir.includes('w')) { w = Math.max(260, startW - dx); l = startL + dx; }
                    if (dir.includes('s')) h = Math.max(180, startH + dy);
                    if (dir.includes('n')) { h = Math.max(180, startH - dy); t = startT + dy; }

                    container.style.width = w + 'px';
                    container.style.left = l + 'px'; container.style.top = t + 'px';
                    // Height is auto from video aspect ratio, but set max
                    state.size = 'custom';
                    container.dataset.size = 'custom';
                };
                const onUp = () => {
                    document.body.style.cursor = ''; document.body.style.userSelect = '';
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });
            container.appendChild(handle);
        });
    }

})();
