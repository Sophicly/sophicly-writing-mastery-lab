/**
 * WML plot island — public mount API.
 *
 * ONE bundle, ONE stylesheet, TWO modes (Neil, #374: a shared plot-picker with a Step-8 mode,
 * "not a second interface"). WML core stays vanilla and talks to the island ONLY through these
 * contracts:
 *
 *   Step 9 — scene selection (beats in → placements out):
 *     WMLSceneIsland.mount({ stages, elements, nudgeRules, initial,
 *                            onStateChange, onTransfer, onClose })
 *   Step 8 — values into the plot (traits + beats in → ports out):
 *     WMLPlotIsland.mount({ traits, stages, bands, initial,
 *                           onStateChange, onPort, onClose })
 *   Either: .unmount()
 *
 * ⚠️ `window.WMLSceneIsland` KEEPS ITS NAME. Step 9 ships green and checks for that exact global
 * (`_cw9SceneCtl.open`); renaming it to something tidier would be a rename for aesthetics that
 * breaks a tested step. The Step-8 mode gets its own global on the same bundle instead.
 *
 * Both modes share ONE host and ONE unmount path, so two islands can never be open at once.
 * The overlay owns scroll isolation (root CLAUDE.md §OVERLAY): overscroll containment via CSS,
 * backdrop wheel/touchmove blocked, body scroll locked while mounted and restored on unmount.
 * Its internal scroller carries min-height:0 (reachability-lint law).
 */
'use strict';
import React from 'react';
import { createRoot } from 'react-dom/client';
import SceneSelection from './SceneSelection.jsx';
import PlotValues from './PlotValues.jsx';

let _root = null;
let _host = null;
let _bodyOverflow = null;

function unmount() {
    if (_root) { try { _root.unmount(); } catch (_) {} _root = null; }
    if (_host) { try { _host.remove(); } catch (_) {} _host = null; }
    if (_bodyOverflow != null) { document.body.style.overflow = _bodyOverflow; _bodyOverflow = null; }
}

// `extraClass` rides ALONGSIDE `swml-scene-island`, never instead of it: that class carries the
// whole design system (surface ladder, type, buttons, the shell), and a mode is a modifier on it.
function makeHost(extraClass) {
    const host = document.createElement('div');
    host.className = 'swml-scene-island' + (extraClass ? ' ' + extraClass : '');
    // block scroll bleed that starts on the overlay ground itself (inner scroller handles its own)
    host.addEventListener('wheel', (e) => { if (e.target === host) e.preventDefault(); }, { passive: false });
    host.addEventListener('touchmove', (e) => { if (e.target === host) e.preventDefault(); }, { passive: false });
    document.body.appendChild(host);
    _host = host;
    _bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    _root = createRoot(host);
    return host;
}

function mount(opts) {
    unmount();
    makeHost(null);
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

function mountValues(opts) {
    unmount();
    makeHost('swml-plot-island');
    const close = () => { try { opts.onClose && opts.onClose(); } catch (_) {} unmount(); };
    _root.render(
        <PlotValues
            traits={opts.traits || []}
            stages={opts.stages || []}
            bands={opts.bands}
            initial={opts.initial || null}
            onStateChange={opts.onStateChange}
            onPort={opts.onPort}
            onClose={close}
        />
    );
    return { unmount };
}

window.WMLSceneIsland = { mount, unmount };
window.WMLPlotIsland = { mount: mountValues, unmount };
