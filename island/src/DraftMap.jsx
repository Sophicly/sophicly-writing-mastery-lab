/**
 * Step 12 — WHERE DOES DRAFT 1 FIT? (FIXLIST #440, v7.20.567).
 *
 * Neil, 2026-08-25: *"in step nine they selected the beats, but then they polished that off, so by
 * the time it reaches draft one it's gonna look quite different to what it was in the scene
 * selection and the plot outline. By the time they get to step twelve they'll need to decide
 * where the elements from that draft fit into, which beats they fit into."* And, on how: *"in the
 * draft, it's just one prose piece … they're gonna need to be able to somehow select which text
 * feeds back into the beats … some of it to feed back into one beat, some of it another beat."*
 *
 * So the draft is shown as SENTENCES, and the student works it in CHUNKS: tap the first sentence
 * of a chunk, tap the last (Step 9's own tap-first-tap-last move, `partition.applyTap`), then tap
 * the beat it belongs to. One chunk at a time (root §18 serial). The chunks are APPENDED under
 * their beats as `Draft 1: …` lines — never replacing anything (PEDAGOGY §29: the student
 * amalgamates) — and the map itself is what the next scene selection reads, so a beat that was
 * drafted keeps its prose (the MERGE, #440).
 *
 * THIRD MODE of the shared island (Neil, #374: "not a second interface"): the host carries
 * `swml-scene-island swml-plot-island swml-draft-island`, so the shell, the type, the buttons, the
 * beat cards, the rail and both themes are all inherited; only the sentence flow is new.
 *
 * PROPS (the whole bridge contract — sentences + beats in, a map out):
 *   sentences     [{id, text, para}]           the draft, split by the engine, in order
 *   beats         [{id, ord, label, text, stageRoman, stageName, inRun}]   inRun = chosen in Step 9
 *   initial       optional saved {chunks:[{from,to,fid}]}  (fid null = "not in my plot yet")
 *   onStateChange (snapshot) => void
 *   onMap         (payload) => Promise<boolean>  — bridge APPENDS; true = filed
 *   onClose       () => void
 */
'use strict';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as P from './partition.js';

const NOT_YET = '__notyet__';

export default function DraftMap(props) {
    const { sentences, beats, onStateChange, onMap, onClose } = props;
    const [chunks, setChunks] = useState(() => (props.initial && Array.isArray(props.initial.chunks)) ? props.initial.chunks.slice() : []);
    /* `sel` seeds from `initial` so the MID-SELECTION screen is renderable to the smoke test —
       the state #452 is about. At runtime this changes nothing: the engine persists chunks, never
       an in-flight selection, so the key is never supplied. Same reasoning as PlotValues' phase /
       cursor seeding in v7.20.570 — an invariant on a screen nothing can render is unverifiable. */
    const [sel, setSel] = useState(() => {
        const s = props.initial && props.initial.sel;
        return s && s.start != null ? { start: s.start, end: s.end == null ? s.start : s.end } : { start: null, end: null };
    });
    const [phase, setPhase] = useState(1);        // 1 = pick a chunk · 2 = pick its beat · 3 = check it over
    const [showAll, setShowAll] = useState(false);
    const [hint, setHint] = useState('');
    const [busy, setBusy] = useState(false);
    const [mapped, setMapped] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!onStateChange) return;
        onStateChange({ chunks: chunks.slice(), phase, mapped });
    }, [chunks, phase, mapped]);   // eslint-disable-line react-hooks/exhaustive-deps

    const scrollTop = () => { if (scrollRef.current) scrollRef.current.scrollTo({ top: 0 }); };
    const goPhase = (n) => { setPhase(n); scrollTop(); };

    /* which sentence index belongs to which chunk (an assigned sentence is not re-pickable) */
    const owner = useMemo(() => {
        const m = new Map();
        chunks.forEach((c, k) => { for (let i = c.from; i <= c.to; i++) m.set(i, k); });
        return m;
    }, [chunks]);
    const beatById = (id) => beats.filter((b) => b.id === id)[0] || null;
    const unassigned = sentences.filter((s, i) => !owner.has(i)).length;
    const runBeats = beats.filter((b) => b.inRun);
    const listed = showAll || !runBeats.length ? beats : runBeats;

    /* ── phase 1: tap first, tap last — a chunk is one continuous stretch ── */
    const tapSentence = (i) => {
        if (owner.has(i)) {
            const c = chunks[owner.get(i)];
            const b = c && c.fid && c.fid !== NOT_YET ? beatById(c.fid) : null;
            setHint('That sentence is already placed' + (b ? ' in #' + b.ord + ' ' + b.label : c && c.fid === NOT_YET ? ' on your "not in the plot yet" list' : '') + ' — tap ✕ on its chunk below to take it back.');
            return;
        }
        setHint('');
        const r = P.applyTap(sel.start, sel.end, i);
        if (r.hint) { setHint('A chunk is one continuous stretch — trim it from either end, or tap outside it to widen it.'); return; }
        // a stretch may not cross an already-placed sentence
        if (r.runStart != null) {
            for (let k = r.runStart; k <= r.runEnd; k++) {
                if (owner.has(k)) { setHint('A chunk can’t run across a sentence you have already placed.'); return; }
            }
        }
        setSel({ start: r.runStart, end: r.runEnd });
    };
    const selCount = sel.start == null ? 0 : sel.end - sel.start + 1;
    const selText = sel.start == null ? '' : sentences.slice(sel.start, sel.end + 1).map((s) => s.text).join(' ');

    /* ── phase 2: the beat ── */
    const assign = (fid) => {
        if (sel.start == null) return;
        setChunks((prev) => prev.concat([{ from: sel.start, to: sel.end, fid }]).sort((a, b) => a.from - b.from));
        setSel({ start: null, end: null });
        setHint('');
        goPhase(1);
    };
    const unassign = (k) => {
        setChunks((prev) => prev.filter((_c, i) => i !== k));
        if (phase === 3) goPhase(1);
    };

    /* ── phase 3: review + map ── */
    const review = useMemo(() => {
        const byBeat = new Map();
        chunks.forEach((c) => {
            const key = c.fid || NOT_YET;
            if (!byBeat.has(key)) byBeat.set(key, []);
            byBeat.get(key).push(c);
        });
        const out = [];
        beats.forEach((b) => { if (byBeat.has(b.id)) out.push({ beat: b, chunks: byBeat.get(b.id) }); });
        if (byBeat.has(NOT_YET)) out.push({ beat: null, chunks: byBeat.get(NOT_YET) });
        return out;
    }, [chunks, beats]);
    const chunkText = (c) => sentences.slice(c.from, c.to + 1).map((s) => s.text).join(' ');

    /* ⭐⭐ v7.20.572 (FIXLIST #451, Neil 2026-08-26, testing Step 12): "when I place the chunks and
       the beats, I don't know which chunks I've placed… it needs to show in the beats outline
       where I've placed chunk one, chunk two, chunk three."
       The beat card said "＋ 2 chunks of your draft will be added here" — a COUNT, which answers
       "how many" and never "which". With several chunks in flight a student cannot match a chunk
       to its beat without opening each one, so the placement they just made is invisible to them.
       Same family as #446: the screen reported a total instead of showing the run.
       The number comes from DRAFT ORDER (the sentence index a chunk starts at), never from the
       order the chunks were placed in — so a chunk keeps its number when an earlier one is taken
       back and re-placed. A number that silently renumbers mid-walk is worse than no number.
       ONE map, used by all four surfaces (the draft, the beat cards, "Placed so far" and the
       review) so they cannot disagree with each other. */
    const chunkKey = (c) => c.from + '-' + c.to;
    const chunkNo = useMemo(() => {
        const m = {};
        chunks.slice().sort((a, b) => a.from - b.from).forEach((c, i) => { m[c.from + '-' + c.to] = i + 1; });
        return m;
    }, [chunks]);
    const doMap = async () => {
        if (busy) return;
        setBusy(true);
        try {
            const payload = {
                chunks: chunks.map((c) => ({ from: c.from, to: c.to, fid: c.fid === NOT_YET ? null : c.fid, text: chunkText(c) })),
                unplaced: sentences.filter((s, i) => !owner.has(i)).map((s) => s.text),
            };
            const ok = await onMap(payload);
            if (ok) setMapped(true);
        } finally { setBusy(false); }
    };

    /* ── renderers ── */
    const renderDraft = () => (
        <section className="phase is-live">
            <p className="eyebrow">Step 1 of 3 · your Draft 1, sentence by sentence</p>
            <h2>Which part of your draft goes into which beat?</h2>
            <p className="lead">Your draft has moved on from the plan — that is what drafting does. Now put it back where it belongs: <strong>tap the first sentence</strong> of a chunk and <strong>tap the last</strong>, everything between comes with it. Then you pick the beat it fits. A chunk can be one sentence or a whole paragraph.</p>
            <div className="dm-draft">
                {sentences.map((s, i) => {
                    const k = owner.has(i) ? owner.get(i) : -1;
                    const c = k >= 0 ? chunks[k] : null;
                    const b = c && c.fid && c.fid !== NOT_YET ? beatById(c.fid) : null;
                    const inSel = sel.start != null && i >= sel.start && i <= sel.end;
                    const isEnd = inSel && (i === sel.start || i === sel.end);
                    const paraStart = i === 0 || sentences[i - 1].para !== s.para;
                    return (
                        <React.Fragment key={s.id}>
                            {paraStart && i > 0 ? <span className="dm-para-break" /> : null}
                            <button type="button"
                                className={'dm-sent' + (inSel ? ' is-sel' : '') + (isEnd ? ' is-end' : '') + (c ? ' is-placed' : '')}
                                title={c ? ('Chunk ' + chunkNo[chunkKey(c)] + (b ? ' — placed in #' + b.ord + ' ' + b.label : ' — not in the plot yet')) : ''}
                                onClick={() => tapSentence(i)}>
                                {c ? <span className="dm-sent-tag">C{chunkNo[chunkKey(c)]}{b ? ' · #' + b.ord : ' · —'}</span> : null}
                                {s.text}
                            </button>
                        </React.Fragment>
                    );
                })}
            </div>
            <p className="hint">{hint}</p>
            {/* ⭐⭐ v7.20.573 (FIXLIST #452, Neil 2026-08-26, testing Step 12): "I selected four.
                And then if I wanted to change it back to three, there's no option for me to do
                that. I can't actually do it."
                MEASURED FIRST (root §19): trimming already worked — applyTap() shrinks the run
                when you tap either END of it (3..6 tap 6 → 3..5), and tapping a single-sentence
                selection clears it. Nothing was broken. But NOTHING ON SCREEN SAID SO: the
                instruction taught "tap the first, tap the last" and then went silent, so once a
                selection existed the student had a stretch of highlighted text and no visible way
                back. An affordance nobody can find is not an affordance — from the student's side
                it is identical to a missing feature, which is exactly how Neil reported it.
                So the way out is now WRITTEN DOWN and one tap away, rather than something you
                have to guess. */}
            {selCount ? (
                <div className="ask-chips dm-sel-tools">
                    <span className="dm-sel-note">
                        <strong>{selCount} sentence{selCount === 1 ? '' : 's'} selected.</strong>{' '}
                        Tap the first or last one again to make the chunk smaller, or a sentence outside it to make it bigger.
                    </span>
                    <button type="button" className="chip-btn" onClick={() => { setSel({ start: null, end: null }); setHint(''); }}>
                        Start this chunk again
                    </button>
                </div>
            ) : null}
            {chunks.length ? (
                <div className="dm-chunks">
                    <div className="dm-chunks-head">Placed so far</div>
                    {chunks.map((c, k) => {
                        const b = c.fid && c.fid !== NOT_YET ? beatById(c.fid) : null;
                        return (
                            <div className="dm-chunk" key={c.from + '-' + c.to}>
                                <span className="dm-chunk-beat"><span className="dm-chunk-no">Chunk {chunkNo[chunkKey(c)]}</span>{b ? <><span className="ord">#{b.ord}</span>{b.label}</> : 'Not in the plot yet'}</span>
                                <span className="dm-chunk-text">{chunkText(c)}</span>
                                <button type="button" aria-label="Take this chunk back" title="Take this chunk back" onClick={() => unassign(k)}>✕</button>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </section>
    );

    const renderBeat = () => (
        <section className="phase is-live">
            <p className="eyebrow">Step 2 of 3 · which beat?</p>
            <h2>Where does this chunk belong?</h2>
            <p className="lead">Tap <strong>one beat</strong>. {runBeats.length ? <>These are the beats you chose for your scene in Step 9 — your draft usually lives in them. If it has drifted somewhere else, <strong>show all beats</strong>.</> : <>These are all the beats of your plot.</>}</p>
            {runBeats.length ? (
                <div className="pv-tools">
                    <button type="button" className={'chip-btn' + (showAll ? ' is-on' : '')} onClick={() => setShowAll(!showAll)}>
                        {showAll ? '✓ Showing all beats' : 'Show all beats'}
                    </button>
                    {/* ⭐ v7.20.574 (FIXLIST #455, Neil 2026-08-26): "it'd be useful if I also have a
                        number somewhere which says previously I chose nine beats… then it'd be
                        easier for me to distinguish."
                        He is right, and it is cheap: the list is already filtered to the Step-9
                        scene, but the filter never said HOW MANY, so there was nothing to check the
                        list against — and he could not remember which step chose them either. The
                        count and the step that produced it are now both stated, and the count is
                        DERIVED from the same runBeats the filter uses, so it cannot drift from the
                        list it describes. */}
                    <span className="pv-tools-note">
                        {showAll
                            ? <>Every beat of your plot — <strong>{beats.length}</strong> in all. Your Step 9 scene is <strong>{runBeats.length}</strong> of them.</>
                            : <>Your <strong>Step 9</strong> scene — the <strong>{runBeats.length}</strong> beat{runBeats.length === 1 ? '' : 's'} you chose for it.</>}
                    </span>
                </div>
            ) : null}
            {(() => {
                let lastStage = null;
                return listed.map((b) => {
                    const head = b.stageRoman !== lastStage;
                    lastStage = b.stageRoman;
                    const placedHere = chunks.filter((c) => c.fid === b.id);
                    return (
                        <React.Fragment key={b.id}>
                            {head ? <div className="stage-head">{b.stageRoman} — {b.stageName}</div> : null}
                            <div className="beat-list">
                                <button type="button" className={'beat-card' + (b.inRun ? '' : ' dm-outside')} onClick={() => assign(b.id)}>
                                    <span className="tick" />
                                    <span>
                                        <span className="b-label"><span className="ord">#{b.ord}</span>{b.label}{b.inRun ? <span className="dm-run-tag">Step 9 scene</span> : null}</span>
                                        <span className="b-text" style={{ display: 'block' }}>{b.text || <em className="pv-empty-note">Empty — nothing written here yet.</em>}</span>
                                        {placedHere.length ? (
                                            <span className="pv-placed">
                                                <span className="pv-placed-state is-add">
                                                    ＋ {placedHere.length} chunk{placedHere.length === 1 ? '' : 's'} of your draft will be added here
                                                </span>
                                                {placedHere.map((c) => (
                                                    <span key={chunkKey(c)} className="pv-placed-chip is-pending">
                                                        <span className="pv-placed-mark">＋</span>
                                                        <span className="pv-placed-trait">Chunk {chunkNo[chunkKey(c)]}</span>
                                                    </span>
                                                ))}
                                            </span>
                                        ) : null}
                                    </span>
                                </button>
                            </div>
                        </React.Fragment>
                    );
                });
            })()}
            <div className="ask-chips">
                <button type="button" className="chip-btn" onClick={() => assign(NOT_YET)}>This isn’t in my plot yet — keep it on my list</button>
                <button type="button" className="chip-btn" onClick={() => goPhase(1)}>Back to the draft</button>
            </div>
        </section>
    );

    const renderRail = () => (
        <aside className="pv-rail" aria-label="The chunk you are placing">
            <p className="pv-rail-eyebrow">Placing · {selCount} sentence{selCount === 1 ? '' : 's'}</p>
            <h3 className="pv-rail-ask">Which beat does this belong to?</h3>
            <p className="pv-rail-do">Your words go <strong>underneath</strong> the beat as a <em>Draft 1:</em> line — nothing you wrote is replaced. You merge them however reads best.</p>
            <p className="pv-rail-said">“{selText}”</p>
        </aside>
    );

    const renderReview = () => (
        <section className="phase is-live">
            <p className="eyebrow">Check it over</p>
            <h2>What’s about to be added to your plot</h2>
            <p className="lead">Your own draft, filed <strong>underneath</strong> the beats you chose, labelled <em>Draft 1:</em>. <strong>Nothing you have written is deleted or replaced</strong> — the plot now carries the progress you made in the draft, and you merge it into each beat however reads best.</p>
            <div className="panel">
                {review.length ? review.map(({ beat, chunks: cs }) => (
                    <div className="pv-review-row" key={beat ? beat.id : NOT_YET}>
                        <div className="pv-r-head">{beat ? <>{beat.stageRoman} · <strong>{beat.label}</strong></> : <strong>Not in the plot yet</strong>}</div>
                        {beat ? <div className={'pv-r-existing' + (beat.text ? '' : ' is-empty')}>{beat.text || 'This beat is empty — the draft line below is what it will start with.'}</div> : null}
                        {cs.map((c) => (
                            <div className="pv-r-add" key={c.from + '-' + c.to}>
                                <span className="pv-r-plus">＋</span>
                                <span className="pv-r-line"><span className="dm-chunk-no">Chunk {chunkNo[chunkKey(c)]}</span>Draft 1: {chunkText(c)}</span>
                            </div>
                        ))}
                    </div>
                )) : <p className="hint">You haven’t placed any of your draft yet — go back and tap a first and last sentence.</p>}
            </div>
            {unassigned ? (
                <div className="pv-noshow">
                    <strong>{unassigned} sentence{unassigned === 1 ? '' : 's'} not placed</strong>
                    <span>They stay in your draft exactly as they are — only what you placed goes into the plot. Go back if you want to place more.</span>
                </div>
            ) : null}
            {mapped ? (
                <div className="done-note">
                    <strong style={{ color: 'var(--ink)' }}>Added.</strong> Your draft is filed under its beats — nothing was overwritten. Close this and carry on.
                </div>
            ) : null}
        </section>
    );

    /* ── footer (liveness: ALWAYS a live button) ── */
    let statusNode, nextLabel, nextDisabled, onNext;
    if (phase === 1) {
        statusNode = selCount
            ? <><strong>{selCount} sentence{selCount === 1 ? '' : 's'}</strong> selected — now choose its beat, or tap either end to change it.</>
            : unassigned
                ? <>{chunks.length ? <><strong>{chunks.length} chunk{chunks.length === 1 ? '' : 's'}</strong> placed · </> : null}<strong>{unassigned}</strong> sentence{unassigned === 1 ? '' : 's'} still to place. Tap the first, then the last.</>
                : <>Every sentence is placed.</>;
        nextLabel = selCount ? 'Choose its beat' : 'Check it over';
        nextDisabled = !selCount && !chunks.length;
        onNext = () => { if (selCount) goPhase(2); else goPhase(3); };
    } else if (phase === 2) {
        statusNode = <>Tap the beat this chunk belongs to — or say it isn’t in your plot yet.</>;
        nextLabel = 'Back to the draft'; nextDisabled = false;
        onNext = () => goPhase(1);
    } else {
        statusNode = mapped
            ? <>Done — <strong>{chunks.length} chunk{chunks.length === 1 ? '' : 's'}</strong> filed under your beats.</>
            : <><strong>{chunks.length}</strong> chunk{chunks.length === 1 ? '' : 's'} to add to your plot.</>;
        nextLabel = mapped ? 'Back to my lesson' : 'Add to my beats';
        nextDisabled = busy || (!mapped && !chunks.length);
        onNext = () => { if (mapped) { onClose(); return; } doMap(); };
    }

    return (
        <div className="ssi-frame">
            <div className="pv-cols">
                <div className="ssi-scroll" ref={scrollRef}>
                    <div className="wrap">
                        <div className="ssi-head">
                            <div>
                                <h1>Put your draft back into your plot</h1>
                                <p className="sub">Draft 1 grew past the plan — good. Now decide <strong>which part of it belongs to which beat</strong>, so your plot carries everything you have learned by writing it.</p>
                            </div>
                            <button type="button" className="ssi-close" aria-label="Close" onClick={onClose}>✕</button>
                        </div>
                        <div className="stepper">
                            {[['1', 'Pick a chunk'], ['2', 'Pick its beat'], ['3', 'Check it over']].map(([n, label]) => {
                                const k = +n;
                                const live = k === phase;
                                const done = k < phase;
                                const disabled = (k === 2 && !selCount) || (k === 3 && !chunks.length);
                                return (
                                    <button type="button" key={k} disabled={disabled && k !== phase}
                                        className={'step-pill' + (live ? ' is-live' : '') + (done ? ' is-done' : '')}
                                        onClick={() => { if (!(disabled && k !== phase)) goPhase(k); }}>
                                        <span className="n">{n}</span> {label}
                                    </button>
                                );
                            })}
                        </div>
                        {phase === 1 ? renderDraft() : null}
                        {phase === 2 ? renderBeat() : null}
                        {phase === 3 ? renderReview() : null}
                    </div>
                </div>
                {phase === 2 ? renderRail() : null}
            </div>
            <div className="actionbar">
                <div className="actionbar-in">
                    <span className="status">{statusNode}</span>
                    {phase > 1 && !mapped
                        ? <button type="button" className="btn" onClick={() => goPhase(1)}>Back</button>
                        : null}
                    <button type="button" className="btn primary" disabled={nextDisabled} onClick={onNext}>{nextLabel}</button>
                </div>
            </div>
        </div>
    );
}
