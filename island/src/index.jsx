/**
 * WML Scene Selection island — public mount API.
 * The bundle is an IIFE exposing window.WMLSceneIsland; WML core stays vanilla and talks
 * to the island ONLY through this contract (beats in → placements out):
 *
 *   WMLSceneIsland.mount({ stages, elements, nudgeRules, initial,
 *                          onStateChange, onTransfer, onClose })
 *   WMLSceneIsland.unmount()
 *
 * The overlay owns scroll isolation (root CLAUDE.md §OVERLAY): overscroll containment via
 * CSS, backdrop wheel/touchmove blocked, body scroll locked while mounted and restored on
 * unmount. Its internal scroller carries min-height:0 (reachability-lint law).
 */
'use strict';
import React from 'react';
import { createRoot } from 'react-dom/client';
import SceneSelection from './SceneSelection.jsx';

let _root = null;
let _host = null;
let _bodyOverflow = null;

function unmount() {
    if (_root) { try { _root.unmount(); } catch (_) {} _root = null; }
    if (_host) { try { _host.remove(); } catch (_) {} _host = null; }
    if (_bodyOverflow != null) { document.body.style.overflow = _bodyOverflow; _bodyOverflow = null; }
}

function mount(opts) {
    unmount();
    const host = document.createElement('div');
    host.className = 'swml-scene-island';
    // block scroll bleed that starts on the overlay ground itself (inner scroller handles its own)
    host.addEventListener('wheel', (e) => { if (e.target === host) e.preventDefault(); }, { passive: false });
    host.addEventListener('touchmove', (e) => { if (e.target === host) e.preventDefault(); }, { passive: false });
    document.body.appendChild(host);
    _host = host;
    _bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    _root = createRoot(host);
    const close = () => { try { opts.onClose && opts.onClose(); } catch (_) {} unmount(); };
    _root.render(
        <SceneSelection
            stages={opts.stages}
            elements={opts.elements}
            nudgeRules={opts.nudgeRules || []}
            initial={opts.initial || null}
            onStateChange={opts.onStateChange}
            onTransfer={opts.onTransfer}
            onClose={close}
        />
    );
    return { unmount };
}

window.WMLSceneIsland = { mount, unmount };
