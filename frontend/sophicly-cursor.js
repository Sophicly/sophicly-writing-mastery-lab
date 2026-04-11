/* ══════════════════════════════════════════════
   SOPHICLY DESIGNER CURSOR — v1.0

   Usage:
     const cursor = new SophiclyCursor({
       name: 'Sarah',
       role: 'student',          // 'student' | 'tutor' | 'ai'
       avatarUrl: '...',         // optional — shows avatar circle in pill
       colour: '#5333ed',        // optional — overrides role preset
       track: 'mouse',           // 'mouse' | 'manual' | 'element'
       target: document.body,    // container to constrain cursor within
       smooth: true,             // lerp movement (softer tracking)
     });

     // Manual positioning (for AI tutor or remote tutor):
     cursor.moveTo(x, y);
     cursor.moveToElement(el);   // glide to a DOM element
     cursor.show();
     cursor.hide();
     cursor.destroy();
   ══════════════════════════════════════════════ */

class SophiclyCursor {

    /**
     * @param {Object} options
     * @param {string}  options.name       - Display name (first name)
     * @param {string}  options.role       - 'student' | 'tutor' | 'ai'
     * @param {string}  [options.avatarUrl]- URL for avatar image
     * @param {string}  [options.colour]   - Override pill/arrow colour
     * @param {string}  [options.track]    - 'mouse' | 'manual' | 'element'
     * @param {Element} [options.target]   - Container element (default: document.body)
     * @param {boolean} [options.smooth]   - Smooth lerp tracking (default: true)
     * @param {boolean} [options.float]    - Floating animation for static cursors
     */
    constructor(options = {}) {
        this.name = options.name || 'Student';
        this.role = options.role || 'student';
        this.avatarUrl = options.avatarUrl || null;
        this.colour = options.colour || null;
        this.track = options.track || 'mouse';
        this.target = options.target || document.body;
        this.smooth = options.smooth !== false;
        this.float = options.float || false;

        this.x = 0;
        this.y = 0;
        this.visible = false;
        this.destroyed = false;
        this._firstMove = true;
        this._isInteractive = false;
        this._raf = null;
        this._boundMove = null;
        this._boundEnter = null;
        this._boundLeave = null;

        this._build();
        this._attach();

        if (this.track === 'mouse') {
            this._startMouseTracking();
        }
    }

    /* ── DOM Construction ── */

    _build() {
        // Container
        this.el = document.createElement('div');
        this.el.className = `sophicly-cursor sophicly-cursor--${this.role}`;
        if (this.smooth && this.track === 'manual') {
            this.el.classList.add('sophicly-cursor--smooth');
        }
        if (this.float) {
            this.el.classList.add('sophicly-cursor--float');
        }

        // Custom colour override
        if (this.colour) {
            this.el.style.setProperty('--cursor-colour', this.colour);
        }

        // SVG arrow
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        arrow.setAttribute('class', 'sophicly-cursor__arrow');
        arrow.setAttribute('viewBox', '0 0 16 16');
        arrow.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d',
            'M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007' +
            'L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z'
        );
        arrow.appendChild(path);
        this.el.appendChild(arrow);

        // Name pill
        const pill = document.createElement('div');
        pill.className = 'sophicly-cursor__pill';
        if (!this.avatarUrl) {
            pill.classList.add('sophicly-cursor__pill--no-avatar');
        }

        // Avatar (optional)
        if (this.avatarUrl) {
            const avatar = document.createElement('img');
            avatar.className = 'sophicly-cursor__avatar';
            avatar.src = this.avatarUrl;
            avatar.alt = this.name;
            avatar.draggable = false;
            pill.appendChild(avatar);
        }

        // Name text
        const nameSpan = document.createElement('span');
        nameSpan.className = 'sophicly-cursor__name';
        nameSpan.textContent = this.name;
        pill.appendChild(nameSpan);

        this.el.appendChild(pill);
    }

    _attach() {
        // Start off-screen so it's never visible at (0,0) before first mouse move
        this.el.style.left = '-200px';
        this.el.style.top = '-200px';
        document.body.appendChild(this.el);
    }

    /* ── Mouse Tracking ── */

    _startMouseTracking() {
        // Hide the system cursor globally via class on <html>
        // CSS rule in sophicly-cursor.css handles the actual cursor: none
        document.documentElement.classList.add('sophicly-cursor-active');

        this._boundMove = (e) => this._onMouseMove(e);
        this._boundEnter = () => this.show();
        this._boundLeave = () => this.hide();
        this._boundClick = (e) => this._onClick(e);

        this.target.addEventListener('mousemove', this._boundMove);
        this.target.addEventListener('mouseenter', this._boundEnter);
        this.target.addEventListener('mouseleave', this._boundLeave);
        this.target.addEventListener('click', this._boundClick, true);
    }

    _onMouseMove(e) {
        this.x = e.clientX;
        this.y = e.clientY;

        // First move: snap instantly to mouse position (no lerp, no animation)
        if (this._firstMove) {
            this._firstMove = false;
            this.el.style.left = this.x + 'px';
            this.el.style.top = this.y + 'px';
            this.show();
            return;
        }

        if (!this.visible) this.show();

        // Detect if hovering over an interactive element
        this._checkInteractive(e.target);

        if (this.smooth) {
            if (!this._raf) this._lerpLoop();
        } else {
            this.el.style.left = this.x + 'px';
            this.el.style.top = this.y + 'px';
        }
    }

    _checkInteractive(target) {
        const interactive = target && target.closest(
            'a, button, [role="button"], input, select, textarea, label, summary, [draggable="true"], [onclick], .sophicly-cursor-interactive'
        );
        if (interactive && !this._isInteractive) {
            this._isInteractive = true;
            this.el.classList.add('sophicly-cursor--interactive');
        } else if (!interactive && this._isInteractive) {
            this._isInteractive = false;
            this.el.classList.remove('sophicly-cursor--interactive');
        }
    }

    _onClick(e) {
        // After a click, immediately switch back to arrow state
        // Use a short delay so the click visually registers first
        requestAnimationFrame(() => {
            this._checkInteractive(e.target);
            // Update position in case the page content shifted
            this.el.style.left = this.x + 'px';
            this.el.style.top = this.y + 'px';
            if (!this.visible) this.show();
        });
    }

    /* Smooth lerp for buttery movement */
    _lerpLoop() {
        if (this.destroyed) return;

        const currentX = parseFloat(this.el.style.left) || this.x;
        const currentY = parseFloat(this.el.style.top) || this.y;

        const factor = 0.35;
        const newX = currentX + (this.x - currentX) * factor;
        const newY = currentY + (this.y - currentY) * factor;

        this.el.style.left = newX + 'px';
        this.el.style.top = newY + 'px';

        // Stop loop when close enough
        if (Math.abs(this.x - newX) > 0.5 || Math.abs(this.y - newY) > 0.5) {
            this._raf = requestAnimationFrame(() => this._lerpLoop());
        } else {
            this.el.style.left = this.x + 'px';
            this.el.style.top = this.y + 'px';
            this._raf = null;
        }
    }

    /* ── Public API ── */

    /**
     * Move cursor to absolute viewport coordinates.
     * For manual/AI cursors that don't track the mouse.
     */
    moveTo(x, y) {
        this.x = x;
        this.y = y;

        if (this.smooth) {
            if (!this._raf) this._lerpLoop();
        } else {
            this.el.style.left = x + 'px';
            this.el.style.top = y + 'px';
        }
    }

    /**
     * Glide cursor to a DOM element's position.
     * Great for AI tutor "reading along" effect.
     */
    moveToElement(element, offsetX = 0, offsetY = 0) {
        if (!element) return;
        const rect = element.getBoundingClientRect();
        this.moveTo(rect.left + offsetX, rect.top + offsetY);
    }

    show() {
        if (this.destroyed) return;
        this.visible = true;
        this.el.classList.add('sophicly-cursor--visible');
    }

    hide() {
        this.visible = false;
        this.el.classList.remove('sophicly-cursor--visible');
    }

    /**
     * Update the display name dynamically.
     */
    setName(name) {
        this.name = name;
        const nameEl = this.el.querySelector('.sophicly-cursor__name');
        if (nameEl) nameEl.textContent = name;
    }

    /**
     * Update the colour dynamically.
     */
    setColour(colour) {
        this.colour = colour;
        this.el.style.setProperty('--cursor-colour', colour);
    }

    /**
     * Clean up everything.
     */
    destroy() {
        this.destroyed = true;
        this.hide();

        if (this._raf) {
            cancelAnimationFrame(this._raf);
            this._raf = null;
        }

        // Restore system cursor
        if (this.track === 'mouse' && this.target) {
            document.documentElement.classList.remove('sophicly-cursor-active');
            this.target.removeEventListener('mousemove', this._boundMove);
            this.target.removeEventListener('mouseenter', this._boundEnter);
            this.target.removeEventListener('mouseleave', this._boundLeave);
            this.target.removeEventListener('click', this._boundClick, true);
        }

        if (this.el && this.el.parentNode) {
            this.el.parentNode.removeChild(this.el);
        }
    }

    /**
     * Generate a unique, vibrant colour from a user ID.
     * Uses the golden angle (137.5°) so adjacent IDs get very different hues.
     * Saturation and lightness are locked for readability against white text.
     */
    static colourFromId(userId) {
        const hue = (userId * 137.508) % 360;
        return `hsl(${Math.round(hue)}, 70%, 55%)`;
    }
}

/* ── Export for module or global use ── */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SophiclyCursor;
} else {
    window.SophiclyCursor = SophiclyCursor;
}

/* ── Auto-init: create cursor for logged-in user ── */
document.addEventListener('DOMContentLoaded', () => {
    if (typeof sophiclyCursorConfig === 'undefined') return;

    // Skip cursor inside iframes — parent page already has one.
    if (window.self !== window.top) return;

    // Students get a unique colour from their user ID; tutors keep role preset
    const studentColour = (sophiclyCursorConfig.role === 'student' && sophiclyCursorConfig.userId)
        ? SophiclyCursor.colourFromId(parseInt(sophiclyCursorConfig.userId, 10))
        : null;

    window.sophiclyCursorInstance = new SophiclyCursor({
        name: sophiclyCursorConfig.name,
        role: sophiclyCursorConfig.role,
        avatarUrl: (sophiclyCursorConfig.role === 'tutor') ? sophiclyCursorConfig.avatarUrl : null,
        colour: studentColour,
        track: 'mouse',
        target: document.body,
        smooth: true
    });
});
