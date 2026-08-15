/**
 * Step 8 — THE VALUES INTERFACE (FIXLIST #374 / #374a / #374b).
 *
 * Neil, 2026-08-13: *"when we're doing it in the chat, they're given so many buttons to choose —
 * which stage and which beat — and there's so many beats in each stage that it's actually quite
 * overwhelming. Can we not have some sort of an interface instead? … maybe having an interface
 * like the one that we built for step nine… it pulls in their full plot, and then they select
 * which traits they wanna cover, and then they select the stage and the beats. But it has to be
 * clearly labelled, because it's beginning and end."*
 *
 * MEASURED, so the overwhelm is not a matter of taste: the eight plot templates hold 97–108
 * askable beat rows each across 6 stages — 16–18 chips per stage in the old chat maze.
 *
 * ⭐ THIS IS THE SAME ISLAND AS STEP 9, IN A SECOND MODE (his instruction: a shared plot-picker
 * with a Step-8 mode, "not a second interface"). Same bundle, same stylesheet, same shell classes
 * — `SceneSelection.jsx` is deliberately NOT refactored, because it shipped green this week and a
 * shared-shell lift would put a tested step at risk for no student-visible gain.
 *
 * PROPS (the whole bridge contract — traits + beats in, ports out):
 *   traits   [{id, trait, label, valueName, cond, said, portText, bands:['begin'|'end'], workedIn}]
 *   stages   [{id, si, roman, name, band, beats:[{id, ord, label, text, worked:{traitId:true}}]}]
 *   bands    {begin:{label,sub}, end:{label,sub}}
 *   initial  optional saved {selected:[traitId], picks:{traitId:[fid]}, noShow:[traitId]}
 *   onStateChange (snapshot) => void   — bridge persists (resume-to-the-exact-item law)
 *   onPort        (payload) => Promise<boolean>  — bridge APPENDS verbatim; true = filed
 *   onClose       () => void
 *
 * ⛔ THE PORT APPENDS, NEVER REPLACES (#374b). This component never claims to "fill" a beat: the
 * review screen shows the beat's EXISTING words with the ported line arriving UNDERNEATH them,
 * because a beat that already holds the student's writing is the NORMAL case and the merge is
 * theirs to make (PEDAGOGY §29).
 */
'use strict';
import React, { useEffect, useMemo, useRef, useState } from 'react';

const BAND_ORDER = ['begin', 'end'];

export default function PlotValues(props) {
    const { traits, stages, bands, onStateChange, onPort, onClose } = props;

    const [phase, setPhase] = useState(1);
    const [selected, setSelected] = useState(() => (props.initial && props.initial.selected) || []);
    const [picks, setPicks] = useState(() => (props.initial && props.initial.picks) || {});
    const [noShow, setNoShow] = useState(() => (props.initial && props.initial.noShow) || []);
    const [cursor, setCursor] = useState(0);        // which SELECTED trait phase 2 is on (serial)
    const [emptyOnly, setEmptyOnly] = useState(false);
    const [busy, setBusy] = useState(false);
    const [ported, setPorted] = useState(false);
    const [hint, setHint] = useState('');
    // #383: the pinned bar's "my words" disclosure. Collapsed by default so the bar stays the
    // ~44px it promises on an iPad in landscape, where vertical room is scarcest.
    const [saidOpen, setSaidOpen] = useState(false);
    const scrollRef = useRef(null);

    const chosen = useMemo(
        () => selected.map((id) => traits.filter((t) => t.id === id)[0]).filter(Boolean),
        [selected, traits]
    );
    const current = chosen[Math.min(cursor, Math.max(0, chosen.length - 1))] || null;

    useEffect(() => {
        if (!onStateChange) return;
        onStateChange({ selected, picks, noShow, phase, cursor, ported });
    }, [selected, picks, noShow, phase, cursor, ported]);   // eslint-disable-line react-hooks/exhaustive-deps

    const pickCount = (id) => ((picks[id] || []).length);
    const placedCount = chosen.filter((t) => pickCount(t.id) > 0 || noShow.indexOf(t.id) !== -1).length;
    const totalPicked = chosen.reduce((n, t) => n + pickCount(t.id), 0);

    /* ── phase 1: which traits ── */
    const toggleTrait = (t) => {
        setSelected((prev) => (prev.indexOf(t.id) !== -1
            ? prev.filter((x) => x !== t.id)
            : prev.concat([t.id])));
        setHint('');
    };

    /* ── phase 2: which beats, one trait at a time (§18 serial) ── */
    const bandsOf = (t) => BAND_ORDER.filter((b) => (t.bands || BAND_ORDER).indexOf(b) !== -1);
    const stagesInBand = (band) => stages.filter((s) => s.band === band);
    const toggleBeat = (t, beat) => {
        if (beat.worked && beat.worked[t.id]) {
            setHint('That beat already carries this trait — pick another, or move on.');
            return;
        }
        setHint('');
        setNoShow((prev) => prev.filter((x) => x !== t.id));   // picking a beat un-says "nowhere yet"
        setPicks((prev) => {
            const have = prev[t.id] || [];
            const next = have.indexOf(beat.id) !== -1 ? have.filter((x) => x !== beat.id) : have.concat([beat.id]);
            const out = Object.assign({}, prev);
            out[t.id] = next;
            return out;
        });
    };
    const sayNoShow = (t) => {
        setPicks((prev) => { const out = Object.assign({}, prev); delete out[t.id]; return out; });
        setNoShow((prev) => (prev.indexOf(t.id) !== -1 ? prev : prev.concat([t.id])));
        setHint('');
        nextTrait();
    };
    const nextTrait = () => {
        if (cursor + 1 < chosen.length) { setCursor(cursor + 1); scrollTop(); return; }
        goPhase(3);
    };
    const scrollTop = () => { if (scrollRef.current) scrollRef.current.scrollTo({ top: 0 }); };
    const goPhase = (n) => { setPhase(n); scrollTop(); };

    /* ── phase 3: review + port ── */
    // Grouped by BEAT, not by trait: what the student is about to change is a beat, and two traits
    // landing in the same beat must read as one change to that beat, not two unrelated rows.
    const review = useMemo(() => {
        const byBeat = new Map();
        chosen.forEach((t) => {
            (picks[t.id] || []).forEach((fid) => {
                if (!byBeat.has(fid)) byBeat.set(fid, []);
                byBeat.get(fid).push(t);
            });
        });
        const out = [];
        stages.forEach((s) => s.beats.forEach((b) => {
            if (byBeat.has(b.id)) out.push({ stage: s, beat: b, traits: byBeat.get(b.id) });
        }));
        return out;
    }, [chosen, picks, stages]);

    const doPort = async () => {
        if (busy) return;
        setBusy(true);
        try {
            const payload = {
                picks: chosen
                    .filter((t) => pickCount(t.id) > 0)
                    .map((t) => ({ traitId: t.id, trait: t.trait, label: t.label, portText: t.portText, fids: picks[t.id].slice() })),
                noShow: noShow.slice(),
            };
            const ok = await onPort(payload);
            if (ok) setPorted(true);
        } finally { setBusy(false); }
    };

    /* ── renderers ── */
    const renderTraits = () => (
        <section className="phase is-live">
            <p className="eyebrow">Step 1 of 3</p>
            <h2>Which of your traits will you work on?</h2>
            <p className="lead">These are the traits you flagged in Step 7 — the ones you said are <strong>in balance, in excess or in deficit</strong>, plus anything on your build list. Pick the ones you want to write into your plot now. <strong>You don’t have to do them all</strong>; you can come back and add more at any time.</p>
            <div className="pv-trait-grid">
                {traits.map((t) => {
                    const on = selected.indexOf(t.id) !== -1;
                    return (
                        <button type="button" key={t.id}
                            className={'pv-trait-card' + (on ? ' is-sel' : '')}
                            onClick={() => toggleTrait(t)}>
                            <span className="tick">{on ? '✓' : ''}</span>
                            <span className="pv-t-main">
                                <span className="pv-t-label">{t.label}</span>
                                <span className="pv-t-value">{t.valueName}</span>
                                <span className="pv-t-cond">{t.cond}</span>
                                {t.said
                                    ? <span className="pv-t-said">“{t.said}”</span>
                                    : <span className="pv-t-said is-none">You didn’t write about this one in Step 7 — we’ll mark the beat and you can write it in the chat.</span>}
                                {t.workedIn
                                    ? <span className="pv-t-worked">Already in {t.workedIn} beat{t.workedIn === 1 ? '' : 's'}</span>
                                    : null}
                            </span>
                        </button>
                    );
                })}
            </div>
            {!traits.length
                ? <p className="hint">No flagged traits came through from Step 7 — go back and finish the values audit first.</p>
                : null}
        </section>
    );

    const renderPlace = () => {
        const t = current;
        if (!t) return null;
        const myBands = bandsOf(t);
        return (
            <section className="phase is-live">
                <p className="eyebrow">Step 2 of 3 — trait {cursor + 1} of {chosen.length}</p>
                <h2>Where does their <span className="pv-inline-trait">{t.label.toLowerCase()}</span> show?</h2>
                <p className="lead">
                    In Step 7 you marked it <strong>{t.cond.toLowerCase()}</strong>
                    {t.said ? <> and wrote: <em>“{t.said}”</em></> : null}. Tap <strong>every beat</strong> where a reader could actually SEE it. Your Step-7 words are added <strong>underneath</strong> each beat you pick — nothing you have written is replaced, and you don’t have to type anything here.
                </p>
                <div className="pv-band-note">
                    {myBands.length === 2
                        ? <>You marked this trait at the <strong>beginning</strong> and at the <strong>end</strong>, so both halves of your plot are open — the beats should carry that journey.</>
                        : myBands[0] === 'begin'
                            ? <>You marked this one at the <strong>beginning</strong> of the story, so these are the stages that matter for it.</>
                            : <>You marked this one at the <strong>end</strong> of the story, so these are the stages that matter for it.</>}
                </div>
                <div className="pv-tools">
                    <button type="button" className={'chip-btn' + (emptyOnly ? ' is-on' : '')}
                        onClick={() => setEmptyOnly(!emptyOnly)}>
                        {emptyOnly ? '✓ Showing empty beats only' : 'Show empty beats only'}
                    </button>
                    <span className="pv-tools-note">Empty beats are fine to pick — filling them in is part of this step.</span>
                </div>
                {/* ⭐ #383 — THE TRAIT STAYS ON SCREEN. Neil, mid-run: *"we need a way to make it
                    visible, you know, the trait, because as soon as I scroll down I can't see it
                    anymore… how would Apple deal with this?"* The ask above it runs ~600px before
                    the first beat card, and a stage holds 8+ beats, so by beat #4 the trait, its
                    condition and his own Step-7 words were all gone.

                    WWAD = the condensing navigation bar: full context at rest, and once you are
                    working the bar keeps only the identity, pinned. So this sits BELOW the full
                    ask and ABOVE the beats — read the long version on arrival, and from the moment
                    you scroll into the list it is stuck to the top of the scroller.

                    ⚠️ Deliberately pure CSS `position: sticky`, no scroll listener: a per-frame
                    layout read inside a scrolling list is the exact shape that has cost this
                    canvas a tab hang before. The browser does it for free.

                    THE COUNT IS NOT DECORATION — it answers his second question without a word of
                    instruction. He asked *"what if I want that trait to appear in multiple beats?"*
                    about a control that already supports it; watching the number climb as he taps
                    is what makes the multi-select legible. */}
                <div className="pv-pin">
                    <div className="pv-pin-main">
                        <span className="pv-pin-trait">{t.label}</span>
                        <span className="pv-pin-cond">{t.cond.toLowerCase()}</span>
                        <span className="pv-pin-of">Trait {cursor + 1} of {chosen.length}</span>
                    </div>
                    <div className="pv-pin-right">
                        <span className={'pv-pin-count' + (pickCount(t.id) ? ' is-on' : '')}>
                            {pickCount(t.id)
                                ? <>{pickCount(t.id)} beat{pickCount(t.id) > 1 ? 's' : ''} picked</>
                                : <>none picked yet</>}
                        </span>
                        {t.said
                            ? <button type="button" className={'pv-pin-said-btn' + (saidOpen ? ' is-on' : '')}
                                aria-expanded={saidOpen ? 'true' : 'false'}
                                onClick={() => setSaidOpen(!saidOpen)}>
                                my words {saidOpen ? '▴' : '▾'}
                            </button>
                            : null}
                    </div>
                    {saidOpen && t.said ? <p className="pv-pin-said">“{t.said}”</p> : null}
                </div>
                {myBands.map((band) => {
                    const inBand = stagesInBand(band);
                    return (
                        <div className="pv-band" key={band}>
                            <div className="pv-band-head">
                                <span className="pv-band-label">{bands[band].label}</span>
                                <span className="pv-band-sub">{bands[band].sub}</span>
                            </div>
                            {inBand.map((s) => {
                                const list = s.beats.filter((b) => (!emptyOnly || !b.text));
                                if (!list.length) return null;
                                return (
                                    <React.Fragment key={s.id}>
                                        <div className="stage-head">{s.roman} — {s.name}</div>
                                        <div className="beat-list">
                                            {list.map((b) => {
                                                const on = (picks[t.id] || []).indexOf(b.id) !== -1;
                                                const already = !!(b.worked && b.worked[t.id]);
                                                return (
                                                    <button type="button" key={b.id}
                                                        className={'beat-card' + (on ? ' is-sel' : '') + (already ? ' pv-worked' : '') + (b.text ? '' : ' pv-empty')}
                                                        onClick={() => toggleBeat(t, b)}>
                                                        <span className="tick">{on ? '✓' : ''}</span>
                                                        <span>
                                                            <span className="b-label"><span className="ord">#{b.ord}</span>{b.label}</span>
                                                            <span className="b-text" style={{ display: 'block' }}>
                                                                {b.text || <em className="pv-empty-note">Empty — nothing written here yet. Pick it and your Step-7 words start it off.</em>}
                                                            </span>
                                                            {already ? <span className="pv-worked-note">Already carries this trait</span> : null}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    );
                })}
                <p className="hint">{hint}</p>
                <div className="ask-chips">
                    {/* §4d + §18: a "no" costs exactly one tap, and it is never a dead end. */}
                    <button type="button" className="chip-btn" onClick={() => sayNoShow(t)}>
                        It doesn’t show anywhere yet — put it on my build list
                    </button>
                    {cursor > 0
                        ? <button type="button" className="chip-btn" onClick={() => { setCursor(cursor - 1); scrollTop(); }}>Back one trait</button>
                        : null}
                </div>
            </section>
        );
    };

    const renderReview = () => (
        <section className="phase is-live">
            <p className="eyebrow">Check it over</p>
            <h2>What’s about to be added to your plot</h2>
            <p className="lead">Your own words from Step 7, filed <strong>underneath</strong> the beats you chose. <strong>Nothing you have written is deleted or replaced</strong> — you merge the new line into the beat however reads best, and Sophia will help you do that next.</p>
            <div className="panel">
                {review.length ? review.map(({ stage, beat, traits: ts }) => (
                    <div className="pv-review-row" key={beat.id}>
                        <div className="pv-r-head">{stage.roman} · <strong>{beat.label}</strong></div>
                        <div className={'pv-r-existing' + (beat.text ? '' : ' is-empty')}>
                            {beat.text || 'This beat is empty — the line below is what it will start with.'}
                        </div>
                        {ts.map((t) => (
                            <div className="pv-r-add" key={t.id}>
                                <span className="pv-r-plus">＋</span>
                                <span className="pv-r-line">Values ({t.label}): {t.portText}</span>
                            </div>
                        ))}
                    </div>
                )) : (
                    <p className="hint">You haven’t picked any beats yet — go back to step 2, or leave the traits on your build list.</p>
                )}
            </div>
            {noShow.length ? (
                <div className="pv-noshow">
                    <strong>On your build list</strong>
                    <span>{noShow.map((id) => (traits.filter((t) => t.id === id)[0] || {}).label).filter(Boolean).join(' · ')} — not in the story yet. That is not a failure: it names exactly what your next drafts have to add.</span>
                </div>
            ) : null}
            {ported ? (
                <div className="done-note">
                    <strong style={{ color: 'var(--ink)' }}>Added.</strong> Every line is filed underneath its beat, in your own words — nothing was overwritten. Close this and Sophia will take you through them one at a time.
                </div>
            ) : null}
        </section>
    );

    /* ── footer status (liveness: there is ALWAYS a live button here) ── */
    let statusNode, nextLabel, nextDisabled;
    if (phase === 1) {
        statusNode = selected.length
            ? <><strong>{selected.length} trait{selected.length > 1 ? 's' : ''}</strong> selected — you’ll place them one at a time.</>
            : 'Choose at least one trait to work on.';
        nextLabel = 'Continue'; nextDisabled = !selected.length;
    } else if (phase === 2) {
        const n = pickCount(current ? current.id : '');
        statusNode = n
            ? <><strong>{n} beat{n > 1 ? 's' : ''}</strong> for {current.label} — a trait usually shows in more than one.</>
            : <>Tap the beats where a reader could see their {current ? current.label.toLowerCase() : 'trait'} — or say it doesn’t show yet.</>;
        nextLabel = cursor + 1 < chosen.length ? 'Next trait' : 'Check it over';
        nextDisabled = false;
    } else {
        statusNode = ported
            ? <>Done — <strong>{totalPicked} line{totalPicked === 1 ? '' : 's'}</strong> filed under your beats.</>
            : <><strong>{placedCount} of {chosen.length}</strong> traits placed · {totalPicked} beat{totalPicked === 1 ? '' : 's'} to add to.</>;
        nextLabel = ported ? 'Back to my lesson' : 'Add to my beats';
        nextDisabled = busy || (!ported && !review.length && !noShow.length);
    }

    return (
        <div className="ssi-frame">
            <div className="ssi-scroll" ref={scrollRef}>
                <div className="wrap">
                    <div className="ssi-head">
                        <div>
                            <h1>Write your values into your plot</h1>
                            <p className="sub">Step 7 worked out who your protagonist <strong>is</strong>. This step puts it where a reader can actually see it — in the beats you have already written.</p>
                        </div>
                        <button type="button" className="ssi-close" aria-label="Close" onClick={onClose}>✕</button>
                    </div>
                    <div className="stepper">
                        {[['1', 'Pick your traits'], ['2', 'Pick your beats'], ['3', 'Check it over']].map(([n, label]) => {
                            const k = +n;
                            const live = k === phase;
                            const done = k < phase;
                            const disabled = (k === 2 && !selected.length) || (k === 3 && !chosen.length);
                            return (
                                <button type="button" key={k} disabled={disabled && k > phase}
                                    className={'step-pill' + (live ? ' is-live' : '') + (done ? ' is-done' : '')}
                                    onClick={() => { if (!(disabled && k > phase)) goPhase(k); }}>
                                    <span className="n">{n}</span> {label}
                                </button>
                            );
                        })}
                    </div>
                    {phase === 1 ? renderTraits() : null}
                    {phase === 2 ? renderPlace() : null}
                    {phase === 3 ? renderReview() : null}
                </div>
            </div>
            <div className="actionbar">
                <div className="actionbar-in">
                    <span className="status">{statusNode}</span>
                    {phase > 1 && !ported
                        ? <button type="button" className="btn" onClick={() => {
                            if (phase === 3) { setCursor(Math.max(0, chosen.length - 1)); goPhase(2); return; }
                            if (cursor > 0) { setCursor(cursor - 1); scrollTop(); return; }
                            goPhase(1);
                        }}>Back</button>
                        : null}
                    <button type="button" className="btn primary" disabled={nextDisabled}
                        onClick={() => {
                            if (phase === 1) { goPhase(2); setCursor(0); return; }
                            if (phase === 2) { nextTrait(); return; }
                            if (ported) { onClose(); return; }
                            doPort();
                        }}>{nextLabel}</button>
                </div>
            </div>
        </div>
    );
}
