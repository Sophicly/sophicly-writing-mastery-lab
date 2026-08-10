/**
 * Scene Selection island — the interaction layer, ported 1:1 from the Neil-approved
 * prototype (research/scene-selection-prototype-APPROVED-2026-08-10.html). The prototype
 * is the interaction spec (root §13): semantics, copy and feedback are carried verbatim;
 * only the host-integration edges differ (props in, onTransfer/onStateChange out, the
 * internal scroller replacing window scroll, and the post-transfer button closing the
 * overlay instead of reloading a demo).
 *
 * PROPS (the whole bridge contract — beats in, placements out):
 *   stages        [{id, roman, name, beats:[{id, ord, label, text}]}]  (only written beats)
 *   elements      the 7 scene elements [{id,label,prompt,c,ca,cb,dk}] — byte-matched to the
 *                 shipped Scene Structure section
 *   nudgeRules    [{re, el}] derived from the archetype's canon beat labels
 *   initial       optional saved state {stageIds, runStartId, runEndId, cuts, added}
 *   onStateChange (snapshot) => void — fired on every mutation (bridge persists; resume law)
 *   onTransfer    (payload) => Promise<boolean> — bridge files verbatim; true = done
 *   onClose       () => void
 */
'use strict';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as P from './partition.js';

/**
 * THE SPL HEADER ARROW — the one Neil actually named (#204 add.21 + the dashboard-lane handoff
 * of the same day): *"why don't we use the arrows that we've got in the SPL header? We use those
 * for navigation at the moment. All we have to do is just flip them ninety degrees, and they can
 * be used as up and down arrows."*
 *
 * ⚠️ CORRECTION, stated rather than silently applied (root §13): an earlier cut of this file used
 * his rounded-square `Left Arrow.svg` / `Right Arrow.svg`. Those are a different asset. This is
 * `.spl-nav-arrows .spl-roll-arrow` from the LearnDash Focus header, saved to the repo at
 * `frontend/icons/spl-roll-arrow.svg` and copied byte-for-byte here.
 *
 * ⚠️ SECOND CORRECTION, also his instruction adjusted rather than obeyed literally: the source
 * points DOWN. So DOWN is the asset untouched and UP is `rotate(180)` — not the 90° he said,
 * which describes the SPL header's own left/right usage of this same down-pointing glyph.
 *
 * The wide, shallow box (31.1 x 11) is why only up/down are offered: rotating a 2.8:1 chevron
 * a quarter-turn leaves its layout box lying on its side. The "Back one element" chip therefore
 * carries no glyph at all rather than a squashed one — its label already says what it does, and
 * no generic arrow remains anywhere in the island.
 *
 * ⚙️ `bin/scene-island-harness.js` asserts this path stays byte-identical to the saved asset.
 */
const SPL_ARROW_PATH = 'M31,0.7l-0.2-0.2C30.6,0,30-0.2,29.2,0.3L16.2,8.5c-0.3,0.2-0.5,0.3-0.6,0.4c-0.1-0.1-0.3-0.3-0.6-0.5 L1.9,0.2C1.2-0.1,0.7-0.1,0.2,0.5L0.1,0.7C0,0.8,0,1,0,1.1s0.1,0.2,0.2,0.3l15,9.5c0.1,0.1,0.2,0.1,0.3,0.1h0.2c0.1,0,0.2,0,0.3-0.1 l15-9.5c0.1-0.1,0.2-0.2,0.2-0.3S31.1,0.8,31,0.7z';
function Arrow({ dir }) {
    return (
        <svg className={'ssi-arrow ssi-arrow-' + dir} viewBox="0 0 31.1 11" width="14" height="5"
            aria-hidden="true" focusable="false"
            style={dir === 'up' ? { transform: 'rotate(180deg)' } : undefined}>
            <path fill="currentColor" d={SPL_ARROW_PATH} />
        </svg>
    );
}

/* Module-level (stable identity — defined inside the parent they would REMOUNT on every
   parent render and lose their input state). */
function AddForm({ show, placeholder, buttonLabel, onAdd }) {
    const inputRef = useRef(null);
    return (
        <div className={'add-form' + (show ? ' show' : '')}>
            <input type="text" maxLength={140} placeholder={placeholder} ref={inputRef}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); if (onAdd(inputRef.current.value)) inputRef.current.value = ''; }
                }} />
            <button type="button" className="btn" style={{ padding: '7px 14px', fontSize: '12.5px' }}
                onClick={() => { if (onAdd(inputRef.current.value)) inputRef.current.value = ''; }}>{buttonLabel}</button>
        </div>
    );
}

function BandAdd({ elm, onAdd }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="band-add">
            <button type="button" className="add-in" onClick={() => setOpen(true)}>＋ Add one in — my story needs this moment</button>
            <AddForm show={open} placeholder="One line: what happens in this moment?" buttonLabel="Add" onAdd={onAdd} />
        </div>
    );
}

function AskPanel({ elm, ask, remaining, mapNode, onAddMoment, onBack }) {
    const [formOpen, setFormOpen] = useState(false);
    return (
        <div className="ask-panel" style={{ '--el-hue': elm.c }}>
            {mapNode}
            <div className="ask-el">
                {remaining === 0
                    ? <>{ask + 1} of 6 — {elm.label}: no beats left, so write this moment now</>
                    : <>{ask + 1} of 6 — {elm.label}: tap the <u>last beat</u> that belongs to it</>}
            </div>
            <div className="ask-what">
                {elm.prompt}
                {ask === 5 ? <em> (the Denouement then takes whatever remains, automatically)</em> : null}
            </div>
            <div className="ask-chips">
                {remaining !== 0
                    ? <button type="button" className="chip-btn" onClick={() => setFormOpen(true)}>My run has no {elm.label} — I’ll add the moment now</button>
                    : null}
                {ask > 0
                    ? <button type="button" className="chip-btn" onClick={onBack}>Back one element</button>
                    : null}
            </div>
            <AddForm show={formOpen || remaining === 0}
                placeholder={'One line: what happens in your ' + elm.label + '?'} buttonLabel="Add it"
                onAdd={onAddMoment} />
        </div>
    );
}

export default function SceneSelection(props) {
    const { stages, elements, nudgeRules, onStateChange, onTransfer, onClose } = props;

    // ── state (mirrors the prototype's `state` object) ──
    const [phase, setPhase] = useState(1);
    const [stageIds, setStageIds] = useState(() => (props.initial && props.initial.stageIds) || []);
    const [run, setRun] = useState(() => {
        const ini = props.initial || {};
        return { start: ini.runStart != null ? ini.runStart : null, end: ini.runEnd != null ? ini.runEnd : null };
    });
    const [cuts, setCuts] = useState(() => (props.initial && props.initial.cuts) || P.freshCuts());
    const [added, setAdded] = useState(() => (props.initial && props.initial.added) || {});
    const [dismissed, setDismissed] = useState(() => new Set());
    const [transferred, setTransferred] = useState(false);
    const [busy, setBusy] = useState(false);
    const [stageHint, setStageHint] = useState('');
    const [beatHint, setBeatHint] = useState('');
    const [shakeId, setShakeId] = useState(null);
    const [landedBeatId, setLandedBeatId] = useState(null);
    const [dragVis, setDragVis] = useState(null);   // {hotBand, hotZone, later} for drop feedback
    const addSeq = useRef(0);
    const scrollRef = useRef(null);
    const beatAreaRef = useRef(null);
    const shapeAreaRef = useRef(null);
    const hintTimer = useRef(null);

    const stageIdx = (id) => stages.findIndex((s) => s.id === id);
    const chosenStages = useMemo(
        () => stages.filter((s) => stageIds.includes(s.id)),
        [stages, stageIds]
    );
    const visibleBeats = useMemo(() => {
        const out = [];
        chosenStages.forEach((s) => s.beats.forEach((b) => out.push(b)));
        return out;
    }, [chosenStages]);
    const runHas = (i) => run.start != null && i >= run.start && i <= run.end;
    const runBeats = useMemo(
        () => (run.start == null ? [] : visibleBeats.slice(run.start, run.end + 1)),
        [visibleBeats, run]
    );

    // report every mutation to the bridge (resume-to-the-exact-item law)
    useEffect(() => {
        if (!onStateChange) return;
        onStateChange({
            stageIds,
            runStart: run.start, runEnd: run.end,
            runStartId: run.start != null ? (visibleBeats[run.start] || {}).id : null,
            runEndId: run.start != null ? (visibleBeats[run.end] || {}).id : null,
            cuts: cuts.slice(), added, phase, transferred,
        });
    }, [stageIds, run, cuts, added, phase, transferred]); // eslint-disable-line react-hooks/exhaustive-deps

    const showBeatHint = (msg) => {
        setBeatHint(msg);
        clearTimeout(hintTimer.current);
        hintTimer.current = setTimeout(() => setBeatHint(''), 3200);
    };

    // the partition is a shape OF the run — a different run needs re-shaping
    const setRunAndSync = (next) => {
        setRun((prev) => {
            if (prev.start === next.start && prev.end === next.end) return prev;
            setCuts(P.freshCuts());
            return next;
        });
    };
    const resetRun = () => { setRun({ start: null, end: null }); setCuts(P.freshCuts()); };

    /* ── phase switching ── */
    const reachable = (k) => {
        if (k === 1) return true;
        if (k === 2) return stageIds.length >= 1;
        if (k === 3) return runBeats.length >= 1;
        return false;
    };
    const goPhase = (n) => {
        setPhase(n);
        if (scrollRef.current) scrollRef.current.scrollTo({ top: 0 });
    };

    /* ── phase 1: stages (pick 1–2, ADJACENT; refusal carries the why) ── */
    const tapStage = (st) => {
        const i = stageIds.indexOf(st.id);
        if (i !== -1) {
            const next = stageIds.filter((x) => x !== st.id);
            setStageIds(next); setStageHint(''); resetRun();
            return;
        }
        if (stageIds.length >= 2) {
            setShakeId(st.id);
            setStageHint('One or two stages only — deselect one first. A scene that spans more stops being a scene.');
            setTimeout(() => setShakeId(null), 350);
            return;
        }
        if (stageIds.length === 1 && Math.abs(stageIdx(stageIds[0]) - stageIdx(st.id)) !== 1) {
            setShakeId(st.id);
            setStageHint('Choose stages next to each other — a scene is one continuous stretch of your story.');
            setTimeout(() => setShakeId(null), 350);
            return;
        }
        const next = [...stageIds, st.id].sort((a, b) => stageIdx(a) - stageIdx(b));
        setStageIds(next); setStageHint(''); resetRun();
    };

    /* ── phase 2: ONE CONTIGUOUS RUN — tap ends, sweep, story strip ── */
    const sweep = useRef({ anchor: null, moved: false });
    const strip = useRef({ anchor: null, moved: false });
    const applyTapAt = (i) => {
        const r = P.applyTap(run.start, run.end, i);
        if (r.hint) { showBeatHint(r.hint); return; }
        setRunAndSync({ start: r.runStart, end: r.runEnd });
    };
    const paintSweep = (i) => {
        const a = sweep.current.anchor;
        setRunAndSync({
            start: Math.min(a, i, run.start != null ? run.start : a),
            end: Math.max(a, i, run.end != null ? run.end : a),
        });
    };
    useEffect(() => {
        // sweep + edge auto-scroll (Photos-style) — the scroller, not the window
        const onMove = (e) => {
            if (sweep.current.anchor == null) return;
            const sc = scrollRef.current;
            const m = 90;
            if (sc) {
                const r = sc.getBoundingClientRect();
                if (e.clientY > r.bottom - m) sc.scrollBy(0, 16);
                else if (e.clientY < r.top + m) sc.scrollBy(0, -16);
            }
            const under = document.elementFromPoint(e.clientX, e.clientY);
            const card = under && under.closest ? under.closest('.beat-card') : null;
            if (!card) return;
            const i = +card.dataset.idx;
            if (i === sweep.current.anchor && run.start == null) return;
            sweep.current.moved = true;
            paintSweep(i);
        };
        const onUp = () => {
            sweep.current.anchor = null;
            setTimeout(() => { sweep.current.moved = false; }, 0);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    });

    /* ── phase 3: beat drag — ONE boundary-maths function under grip, arrows and drops ── */
    const beatDrag = useRef(null);
    useEffect(() => {
        const onMove = (e) => {
            const d = beatDrag.current;
            if (!d) return;
            d.moved = true;
            if (d.ghost) { d.ghost.style.left = (e.clientX - 30) + 'px'; d.ghost.style.top = (e.clientY - 18) + 'px'; }
            const sc = scrollRef.current;
            const m = 90;
            if (sc) {
                const r = sc.getBoundingClientRect();
                if (e.clientY > r.bottom - m) sc.scrollBy(0, 14);
                else if (e.clientY < r.top + m) sc.scrollBy(0, -14);
            }
            let hotBand = null, hotZone = false;
            const root = shapeAreaRef.current;
            if (root) {
                root.querySelectorAll('.band').forEach((b) => {
                    const r = b.getBoundingClientRect();
                    if (e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right) hotBand = +b.dataset.band;
                });
                const z = root.querySelector('.u-zone');
                if (z) {
                    const r = z.getBoundingClientRect();
                    hotZone = e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right;
                }
            }
            // the slot line sits where the beat will actually land: top when it becomes the
            // band's first beat (moving later), bottom when it becomes its last
            const later = d.c !== -1 && hotBand != null && hotBand > d.c;
            // the SYNC ref is what pointerup reads — React state is async and a fast release
            // would read the previous frame's target (the prototype read live DOM classes)
            hotRef.current = { hotBand, hotZone };
            setDragVis({ hotBand, hotZone, later, src: d.g });
        };
        const onUp = () => {
            const d = beatDrag.current;
            if (!d) return;
            const vis = hotRef.current;
            if (vis && (vis.hotBand != null || vis.hotZone)) {
                const rb = runBeatsRef.current[d.g];
                if (rb) setLandedBeatId(rb.id);
                setCuts((prev) => {
                    const next = prev.slice();
                    if (vis.hotBand != null) P.applyBeatMove(next, runBeatsRef.current.length, d.g, { band: vis.hotBand });
                    else P.applyBeatMove(next, runBeatsRef.current.length, d.g, { unshaped: true });
                    return next;
                });
            }
            if (d.ghost) d.ghost.remove();
            if (d.moved) { justDragged.current = true; setTimeout(() => { justDragged.current = false; }, 0); }
            beatDrag.current = null;
            setDragVis(null);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    }, []);
    const hotRef = useRef(null);
    const runBeatsRef = useRef([]);
    useEffect(() => { runBeatsRef.current = runBeats; }, [runBeats]);
    const justDragged = useRef(false);

    const startBeatDrag = (e, g, rowEl) => {
        const c0 = P.bandOf(cuts, g);
        const ghost = rowEl.cloneNode(true);
        ghost.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;width:' + rowEl.offsetWidth
            + 'px;opacity:.92;background:var(--surface2);border-radius:10px;box-shadow:var(--shadow-lg);display:flex;gap:10px;padding:8px 14px;';
        // append INSIDE the island root — on document.body the island's CSS vars don't resolve
        // and the ghost renders transparent
        (rowEl.closest('.swml-scene-island') || document.body).appendChild(ghost);
        beatDrag.current = { g, c: c0, ghost, moved: false };
        e.preventDefault();
    };

    const moveByArrow = (g, dir) => {
        const c = P.bandOf(cuts, g);
        if (c === -1) return;
        const ask = P.firstPending(cuts);
        const settled = ask === -1 ? P.ELEMENT_COUNT : ask;
        const rb = runBeats[g];
        if (rb) setLandedBeatId(rb.id);
        setCuts((prev) => {
            const next = prev.slice();
            if (dir === 'up' && c > 0) P.applyBeatMove(next, runBeats.length, g, { band: c - 1 });
            else if (dir === 'down') {
                if (c + 1 < settled) P.applyBeatMove(next, runBeats.length, g, { band: c + 1 });
                else P.applyBeatMove(next, runBeats.length, g, { unshaped: true });   // below the frontier = back to still-to-shape
            }
            return next;
        });
    };

    /* ── derived shape data (normalized: the Denouement takes the remainder automatically) ── */
    const normCuts = useMemo(() => {
        const next = cuts.slice();
        P.normalizeCuts(next, runBeats.length);
        return next;
    }, [cuts, runBeats.length]);
    const ranges = useMemo(() => P.chunkRanges(normCuts), [normCuts]);
    const ask = P.firstPending(normCuts);
    const complete = ask === -1;
    const consumed = complete ? runBeats.length : ranges[ask].start;
    const emptyIdx = complete
        ? elements.findIndex((e, i) => (ranges[i].end - ranges[i].start) + (added[e.id] || []).length === 0)
        : -1;
    // normalizeCuts is derived here (normCuts) but the AUTHORITATIVE cuts state must match it
    // once complete, so a subsequent applyBeatMove sees the settled Denouement:
    useEffect(() => {
        if (P.firstPending(cuts) === P.ELEMENT_COUNT - 1) {
            setCuts((prev) => {
                const next = prev.slice();
                P.normalizeCuts(next, runBeats.length);
                return next;
            });
        }
    }, [cuts, runBeats.length]);

    const addMoment = (elId, text) => {
        const v = String(text || '').trim();
        if (!v) return false;
        setAdded((prev) => ({ ...prev, [elId]: [...(prev[elId] || []), { id: 'new' + (++addSeq.current), text: v }] }));
        return true;
    };

    /* ── transfer ── */
    const doTransfer = async () => {
        if (busy) return;
        setBusy(true);
        try {
            const payload = {
                stageIds: stageIds.slice(),
                elements: elements.map((elm, i) => ({
                    id: elm.id,
                    beats: (ranges[i].pending ? [] : runBeats.slice(ranges[i].start, ranges[i].end))
                        .map((b) => ({ id: b.id, ord: b.ord, label: b.label, text: b.text })),
                    added: (added[elm.id] || []).map((a) => a.text),
                })),
            };
            const ok = await onTransfer(payload);
            if (ok) setTransferred(true);
        } finally { setBusy(false); }
    };

    /* ── renderers ── */
    const renderStages = () => (
        <section className="phase is-live">
            <p className="eyebrow">Step 1 of 3</p>
            <h2>Which part of your story is the scene from?</h2>
            <p className="lead">Choose <strong>one or two stages next to each other</strong> — two works well when your scene sits across a boundary, like the end of Stage I and the start of Stage II. A scene is one continuous stretch of your story, so the stages must touch — and more than two stops being a scene.</p>
            <div className="stage-grid">
                {stages.map((st) => (
                    <button type="button" key={st.id}
                        className={'stage-card' + (stageIds.includes(st.id) ? ' is-sel' : '') + (shakeId === st.id ? ' shake' : '')}
                        onClick={() => tapStage(st)}>
                        <div className="roman">{st.roman}</div>
                        <div className="name">{st.name}</div>
                        <div className="meta">{st.beats.length} beats written</div>
                    </button>
                ))}
            </div>
            <p className="hint">{stageHint}</p>
        </section>
    );

    const renderStrip = () => {
        let idx = -1;
        return (
            <div className="strip-wrap">
                <div className="storystrip" aria-label="Your whole story — one tick per beat; the highlighted span is your scene"
                    onPointerDown={(e) => {
                        const seg = e.target.closest('.seg'); if (!seg) return;
                        strip.current = { anchor: +seg.dataset.idx, moved: false };
                        try { e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
                        e.preventDefault();
                    }}
                    onPointerMove={(e) => {
                        if (strip.current.anchor == null) return;
                        const under = document.elementFromPoint(e.clientX, e.clientY);
                        const seg = under && under.closest ? under.closest('.seg') : null;
                        if (!seg) return;
                        const i = +seg.dataset.idx;
                        if (!strip.current.moved && i === strip.current.anchor) return;
                        strip.current.moved = true;
                        // a strip drag SETS the span, trim-handle style
                        setRunAndSync({ start: Math.min(strip.current.anchor, i), end: Math.max(strip.current.anchor, i) });
                    }}
                    onPointerUp={() => {
                        if (strip.current.anchor != null && !strip.current.moved) {
                            const i = strip.current.anchor;
                            applyTapAt(i);
                            const card = (beatAreaRef.current || document).querySelector('.beat-card[data-idx="' + i + '"]');
                            if (card) card.scrollIntoView({ block: 'center', behavior: 'smooth' });
                        }
                        strip.current = { anchor: null, moved: false };
                    }}>
                    {chosenStages.map((st) => (
                        <div className="strip-group" key={st.id} style={{ flexGrow: st.beats.length }}>
                            <div className="strip-segs">
                                {st.beats.map((b) => {
                                    idx++;
                                    const i = idx;
                                    return (
                                        <button type="button" key={b.id} data-idx={i}
                                            className={'seg' + (runHas(i) ? ' in-run' : '') + ((runHas(i) && (i === run.start || i === run.end)) ? ' is-end' : '')}
                                            title={'#' + b.ord + ' ' + b.label}
                                            aria-label={'#' + b.ord + ' ' + b.label} />
                                    );
                                })}
                            </div>
                            <div className="strip-label">{st.roman}</div>
                        </div>
                    ))}
                </div>
                <p className="strip-hint">Your whole story at a glance — one tick per beat. Drag across the strip to set your span; tap a tick to jump to that beat below.</p>
            </div>
        );
    };

    const renderBeats = () => {
        let idx = -1;
        return (
            <section className="phase is-live">
                <p className="eyebrow">Step 2 of 3</p>
                <h2>Which beats will your scene cover?</h2>
                <p className="lead">These are your own beats from the stages you chose, in <strong>story order</strong>. Your scene is <strong>one continuous run</strong>: tap the first beat, then tap the last — everything between comes with it. Tap an end beat to trim it back; widen the run at either end any time. When you draft, you can still leave out a beat you don't need — but the run you select stays unbroken.</p>
                {renderStrip()}
                <div ref={beatAreaRef}
                    onPointerDown={(e) => {
                        const card = e.target.closest('.beat-card'); if (!card) return;
                        sweep.current.anchor = +card.dataset.idx;
                    }}
                    onClick={(e) => {
                        const card = e.target.closest('.beat-card'); if (!card) return;
                        e.preventDefault();
                        if (sweep.current.moved) { sweep.current.moved = false; return; }   // a sweep already applied
                        applyTapAt(+card.dataset.idx);
                    }}>
                    {chosenStages.map((st) => (
                        <React.Fragment key={st.id}>
                            <div className="stage-head">{st.roman} — {st.name}</div>
                            <div className="beat-list">
                                {st.beats.map((b) => {
                                    idx++;
                                    const i = idx;
                                    const inRun = runHas(i);
                                    const isEnd = inRun && (i === run.start || i === run.end);
                                    return (
                                        <button type="button" key={b.id} data-idx={i}
                                            className={'beat-card' + (inRun ? ' is-sel' : '') + (isEnd ? ' is-end' : '')}>
                                            <span className="tick">{inRun ? '✓' : ''}</span>
                                            <span>
                                                <span className="b-label"><span className="ord">#{b.ord}</span>{b.label}</span>
                                                <span className="b-text" style={{ display: 'block' }}>{b.text}</span>
                                            </span>
                                            {isEnd ? <span className="trim-note">tap to trim</span> : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </React.Fragment>
                    ))}
                    <p className="hint">{beatHint}</p>
                </div>
            </section>
        );
    };

    // ⭐ the 7-element map (addendum 9) — done (tick + count) · current · upcoming
    const renderElMap = () => (
        <>
            <div className="el-map">
                {elements.map((elm, i) => {
                    const done = normCuts[i] != null;
                    const now = !complete && i === ask;
                    const n = done ? normCuts[i] + ((added[elm.id] || []).length) : 0;
                    const st = now
                        ? { background: elm.c, color: elm.dk ? '#1C1D1F' : '#fff' }
                        : { background: elm.ca, ...(done ? { color: 'var(--ink)' } : {}) };
                    return (
                        <span key={elm.id} className={'el-pill' + (done ? ' is-done' : '') + (now ? ' is-now' : '')} style={st} title={elm.prompt}>
                            <span className="n" style={now ? undefined : { color: elm.c, opacity: 1 }}>{i + 1}</span>{elm.label}
                            {done ? <span className="tickmark"> ✓{n ? ' ' + n : ''}</span> : null}
                        </span>
                    );
                })}
            </div>
            {!complete
                ? <div className="el-map-hint">Your scene’s seven elements, in order — plan ahead: a beat you leave unshaped stays available for the elements still to come. Tapped too early? Drag any beat by its ⠿ handle — up into an element, or back down to un-shape it.</div>
                : null}
        </>
    );

    // ⭐ mismatch nudges (addenda 7+8): per TYPE, at-least-one-home, dismissible, never a force
    const renderNudges = () => {
        const findings = P.nudgeFindings(runBeats, normCuts, elements, nudgeRules || [], dismissed);
        return findings.map(({ elId, wantIdx, items }) => {
            let body;
            if (items.length > 1) {
                body = (
                    <>You have {items.length} {elements[wantIdx].label.toLowerCase()} moments ({items.map((x, k) => (
                        <React.Fragment key={x.beat.id}>{k > 0 ? ' and ' : ''}<strong>#{x.beat.ord}</strong></React.Fragment>
                    ))}), and none of them sits in your <strong>{elements[wantIdx].label}</strong> element. Worth dragging <u>one</u> of them there — the rest are fine where they are.</>
                );
            } else {
                const x = items[0];
                const inEl = elements.findIndex((e, i) => !ranges[i].pending && x.g >= ranges[i].start && x.g < ranges[i].end);
                body = (
                    <>Your beat <strong>#{x.beat.ord} — {x.beat.label}</strong> is sitting in <strong>{inEl !== -1 ? elements[inEl].label : '—'}</strong>. In the 7-element structure, a moment like this usually IS the <strong>{elements[wantIdx].label}</strong> — drag it there by its ⠿ handle, or keep it if you placed it on purpose.</>
                );
            }
            return (
                <div className="nudge" key={elId}>
                    <div className="n-title">Worth a look</div>
                    <div className="n-body">{body}</div>
                    <div className="ask-chips">
                        <button type="button" className="chip-btn"
                            onClick={() => setDismissed((prev) => new Set(prev).add('el:' + elId))}>
                            Keep things where they are
                        </button>
                    </div>
                </div>
            );
        });
    };

    const renderShape = () => {
        const bands = [];
        elements.forEach((elm, i) => {
            if (!complete && i >= ask) return;
            const r = ranges[i];
            const chips = runBeats.slice(r.start, r.end);
            const adds = added[elm.id] || [];
            const empty = chips.length + adds.length === 0;
            const isHot = dragVis && dragVis.hotBand === i;
            bands.push(
                <div key={elm.id} data-band={i}
                    className={'band' + (empty ? ' is-empty' : '') + (isHot ? ' drop-hot' : '')
                        + (isHot && dragVis.later ? ' drop-top' : '') + (isHot && !dragVis.later ? ' drop-bottom' : '')}
                    style={{ '--el-hue': elm.c }}>
                    {/* the hue rides as a leading NUMBER BADGE + the header tint — never a side
                        stripe (Neil, 2026-08-10; also a banned pattern in the design system) */}
                    <div className="band-head" style={{ background: elm.ca }}>
                        <span className="el"><span className="ord">{i + 1}</span>{elm.label}</span>
                        <span className="el-prompt">{elm.prompt}</span>
                        <span className="count">{empty ? 'empty — add a moment' : (chips.length + adds.length) + ' beat' + (chips.length + adds.length > 1 ? 's' : '')}</span>
                    </div>
                    {chips.map((b, k) => {
                        const g = r.start + k;
                        // Contiguity makes edge beats the ONLY legal single-beat moves — the arrows
                        // on each band's first/last beat are the complete click alternative to drag.
                        const ctl = [];
                        if (k === 0 && i > 0) ctl.push(
                            <button type="button" key="up" className="row-move" title={'Move up into ' + elements[i - 1].label}
                                onClick={() => moveByArrow(g, 'up')}><Arrow dir="up" /></button>);
                        if (k === chips.length - 1 && i < 6) ctl.push(
                            <button type="button" key="down" className="row-move" title="Move down a section"
                                onClick={() => moveByArrow(g, 'down')}><Arrow dir="down" /></button>);
                        return (
                            <div key={b.id} data-g={g}
                                className={'p3-row' + (b.id === landedBeatId ? ' just-landed' : '') + (dragVis && dragVis.src === g ? ' drag-src' : '')}>
                                <span className="row-grip" title="Drag this beat to another element"
                                    onPointerDown={(e) => startBeatDrag(e, g, e.target.closest('.p3-row'))}>⠿</span>
                                <span className="b-label"><span className="ord">#{b.ord}</span>{b.label}</span>
                                <span className="b-text">{b.text}</span>
                                {ctl.length ? <span className="row-ctl">{ctl}</span> : null}
                            </div>
                        );
                    })}
                    {adds.map((a) => (
                        <div className="p3-row new" key={a.id}>
                            <span className="b-label">New — added in</span>
                            <span className="b-text">{a.text}</span>
                            <button type="button" aria-label="Remove"
                                onClick={() => setAdded((prev) => ({ ...prev, [elm.id]: (prev[elm.id] || []).filter((x) => x.id !== a.id) }))}>✕</button>
                        </div>
                    ))}
                    <BandAdd elm={elm} onAdd={(v) => addMoment(elm.id, v)} />
                </div>
            );
        });

        const rest = runBeats.slice(consumed);
        return (
            <section className="phase is-live">
                <p className="eyebrow">Step 3 of 3</p>
                <h2>Shape your run into the Scene Structure</h2>
                <p className="lead">A scene is a mini story, and its seven elements happen <strong>in order</strong> — hook first, denouement last — exactly like your beats do. So shaping is drawing the lines: element by element, tap the <strong>last beat</strong> that belongs to it; the <strong>Denouement takes whatever remains automatically</strong>. And nothing is final as you go — <strong>you can drag any beat by its ⠿ handle</strong> into a different element at any time, during shaping and after. Your beats never leave story order.</p>
                <div ref={shapeAreaRef}>
                    {!complete ? (
                        <AskPanel key={ask} elm={elements[ask]} ask={ask}
                            remaining={runBeats.length - consumed}
                            mapNode={renderElMap()}
                            onBack={() => setCuts((prev) => { const next = prev.slice(); next[ask - 1] = null; return next; })}
                            onAddMoment={(v) => {
                                if (!addMoment(elements[ask].id, v)) return false;
                                setCuts((prev) => { const next = prev.slice(); next[ask] = 0; return next; });   // the added moment IS this element
                                return true;
                            }} />
                    ) : (
                        <>
                            <div>{renderElMap()}</div>
                            <div className="refine-banner">
                                <strong>Refine</strong>
                                <span>All 7 shaped. Changed your mind? Drag any beat by its ⠿ handle into a different element — the beats in between move with it, so your story order holds. If that leaves an element empty, it will ask for a moment.</span>
                                <button type="button" className="reshape" onClick={() => setCuts(P.freshCuts())}>Reshape from scratch</button>
                            </div>
                            {renderNudges()}
                        </>
                    )}
                    {bands}
                    {!complete && rest.length ? (
                        <>
                            <div className="unshaped-head">Still to shape — in story order</div>
                            <div className={'u-zone' + (dragVis && dragVis.hotZone ? ' drop-hot' : '')}>
                                {rest.map((b, k) => (
                                    <button type="button" key={b.id} className="u-row"
                                        onClick={() => {
                                            if (justDragged.current) { justDragged.current = false; return; }
                                            setCuts((prev) => { const next = prev.slice(); next[ask] = k + 1; return next; });
                                        }}>
                                        <span className="row-grip" title="Drag this beat up into an element"
                                            onPointerDown={(e) => { e.stopPropagation(); startBeatDrag(e, consumed + k, e.target.closest('.u-row')); }}>⠿</span>
                                        <span className="b-label"><span className="ord">#{b.ord}</span>{b.label}</span>
                                        <span className="b-text">{b.text}</span>
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : null}
                </div>
            </section>
        );
    };

    const renderSummary = () => (
        <section className="phase is-live">
            <p className="eyebrow">Check it over</p>
            <h2>Your scene, element by element</h2>
            <p className="lead">This is exactly what will land in your <strong>Scene Structure</strong> (not your plot outline — that stays untouched). Your own words, in story order, moved not retyped. You can go back and change any of it.</p>
            <div className="panel">
                {elements.map((elm, i) => {
                    const chips = ranges[i].pending ? [] : runBeats.slice(ranges[i].start, ranges[i].end);
                    const adds = added[elm.id] || [];
                    return (
                        <div key={elm.id} className={'summary-row' + ((chips.length + adds.length) ? '' : ' fresh')}
                            style={{ '--el-hue': elm.c }}>
                            <span className="el">{elm.label}</span>
                            <span className="what">
                                {(chips.length + adds.length) ? (
                                    <>
                                        {chips.map((b, k) => (
                                            <React.Fragment key={b.id}>{k > 0 ? <br /> : null}
                                                <span className="own"><span className="ord">#{b.ord}</span>{b.text}</span>
                                            </React.Fragment>
                                        ))}
                                        {adds.map((a) => (
                                            <React.Fragment key={a.id}>{chips.length ? <br /> : null}
                                                <span className="own">{a.text}</span> <em>(added in)</em>
                                            </React.Fragment>
                                        ))}
                                    </>
                                ) : 'Nothing here — go back and add a moment.'}
                            </span>
                        </div>
                    );
                })}
            </div>
            {transferred ? (
                <div className="done-note">
                    <strong style={{ color: 'var(--ink)' }}>Transferred.</strong> Every beat is filed verbatim under its element in your Scene Structure — nothing retyped, nothing overwritten without asking you. Reopen this any time to change your selection.
                </div>
            ) : null}
        </section>
    );

    /* ── footer status (copy carried from the prototype) ── */
    let statusNode, nextLabel, nextDisabled;
    if (phase === 1) {
        const n = stageIds.length;
        statusNode = n ? <><strong>{n} stage{n > 1 ? 's' : ''}</strong> selected.</> : 'Choose one or two stages.';
        nextLabel = 'Continue'; nextDisabled = !n;
    } else if (phase === 2) {
        const n = runBeats.length;
        statusNode = n
            ? <><strong>{n} beat{n > 1 ? 's' : ''}</strong> in your run — one continuous stretch, in story order. Enough to cover the 7 elements; too many and the writing goes shallow.</>
            : 'Tap the first beat of your scene, then the last — the run in between comes with it.';
        nextLabel = 'Continue'; nextDisabled = !n;
    } else if (phase === 3) {
        if (!complete) {
            statusNode = <>Shaping: <strong>{elements[ask].label}</strong> ({ask + 1} of 6) — tap the last beat that belongs to it; the Denouement takes the rest automatically.</>;
            nextLabel = 'Check it over'; nextDisabled = true;
        } else if (emptyIdx !== -1) {
            statusNode = <><strong>{elements[emptyIdx].label}</strong> is empty — every element needs at least one moment. Add one in, or drag a beat to give it one.</>;
            nextLabel = 'Check it over'; nextDisabled = true;
        } else {
            statusNode = <><strong>All 7 elements shaped</strong> — story order locked. Drag any beat by its ⠿ handle to refine.</>;
            nextLabel = 'Check it over'; nextDisabled = false;
        }
    } else {
        statusNode = transferred
            ? 'Done — your Scene Structure holds your own words, in story order.'
            : 'Happy with it? Transfer files every beat verbatim, in story order.';
        nextLabel = transferred ? 'Back to your lesson' : 'Transfer into my Scene Structure';
        nextDisabled = busy;
    }

    return (
        <div className="ssi-frame">
            <div className="ssi-scroll" ref={scrollRef}>
                <div className="wrap">
                    <div className="ssi-head">
                        <div>
                            <h1>Choose the scene you’ll write</h1>
                            <p className="sub">Your exam story is one <strong>scene</strong> — a mini story with the same structure. Pick the part of your plot it will cover, then shape it into the 7 elements.</p>
                        </div>
                        <button type="button" className="ssi-close" aria-label="Close" onClick={onClose}>✕</button>
                    </div>
                    <div className="stepper">
                        {[['1', 'Pick your stage(s)'], ['2', 'Pick your beats'], ['3', 'Shape the scene']].map(([n, label]) => {
                            const k = +n;
                            const live = k === Math.min(phase, 3);
                            const done = k < phase;
                            const disabled = k > Math.min(phase, 3) && !reachable(k);
                            return (
                                <button type="button" key={k} disabled={disabled}
                                    className={'step-pill' + (live ? ' is-live' : '') + (done ? ' is-done' : '')}
                                    onClick={() => { if (k <= 3 && reachable(k)) goPhase(k); }}>
                                    <span className="n">{n}</span> {label}
                                </button>
                            );
                        })}
                    </div>
                    {phase === 1 ? renderStages() : null}
                    {phase === 2 ? renderBeats() : null}
                    {phase === 3 ? renderShape() : null}
                    {phase === 4 ? renderSummary() : null}
                </div>
            </div>
            <div className="actionbar">
                <div className="actionbar-in">
                    <span className="status">{statusNode}</span>
                    {phase > 1 ? <button type="button" className="btn" onClick={() => goPhase(phase - 1)}>Back</button> : null}
                    <button type="button" className="btn primary" disabled={nextDisabled}
                        onClick={() => {
                            if (phase === 4) {
                                if (transferred) { onClose(); return; }
                                doTransfer(); return;
                            }
                            goPhase(phase + 1);
                        }}>{nextLabel}</button>
                </div>
            </div>
        </div>
    );
}
