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
 *   initial  optional saved {picks:{traitId:[fid]}, noShow:['traitId|band'], band, phase, cursor}
 *            (v7.20.537: `selected` is gone — a pass places EVERY trait of its band, #401)
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

    /* ⭐⭐ v7.20.537 (FIXLIST #401, Neil 2026-08-19) — TWO PASSES, AND NO CHOOSING.
       His words: *"it shouldn't give the students an option to choose the traits that they want…
       they actually have to seed all of them. What they can choose is WHERE they seed them."* And
       the order: *"here are your traits for the beginning, and then… these are the beginning
       stages and beats, place those in. And then once you're done with that, here are your traits
       for the end, here are your end stages and beats."*
       WHY IT WAS WRONG BEFORE, and it is not cosmetic: one screen offered EVERY trait — beginning
       and end together, each collapsed to a single condition — and then let the student drop an
       END trait into a BEGINNING beat. A trait's beginning state and its end state are different
       facts about the character (18 of 22 differ on the real staging document), so mixing them
       makes the placement meaningless. Splitting by band makes the wrong placement unreachable
       rather than merely discouraged.
       `selected` is GONE. A pass runs every trait carrying a condition for that band. */
    const [phase, setPhase] = useState(1);          // 1 = this band's traits · 2 = place them · 3 = review
    const [band, setBand] = useState(() => ((props.initial && props.initial.band) === 'end' ? 'end' : 'begin'));
    const [picks, setPicks] = useState(() => (props.initial && props.initial.picks) || {});
    const [noShow, setNoShow] = useState(() => (props.initial && props.initial.noShow) || []);
    const [cursor, setCursor] = useState(0);        // which trait of THIS BAND phase 2 is on (serial)
    const [emptyOnly, setEmptyOnly] = useState(false);
    const [busy, setBusy] = useState(false);
    const [ported, setPorted] = useState(false);
    const [hint, setHint] = useState('');
    const scrollRef = useRef(null);

    /* Which traits belong to a pass: the ones the student gave a condition for at THAT end of the
       story. `bands` is computed engine-side from their Step-7 record (_cw8BandsFor), so a trait
       marked at both ends is legitimately in both passes — carrying that half's own condition and
       that half's own words, which is exactly the journey the step is teaching. */
    const traitsInBand = (b) => (traits || []).filter((t) => (t.bands || BAND_ORDER).indexOf(b) !== -1);
    const chosen = useMemo(() => traitsInBand(band), [traits, band]);
    // A band with nothing in it is SKIPPED, never shown as an empty screen (§4d liveness).
    const bandsWithTraits = useMemo(
        () => BAND_ORDER.filter((b) => traitsInBand(b).length > 0),
        [traits]
    );
    const current = chosen[Math.min(cursor, Math.max(0, chosen.length - 1))] || null;

    /* ⭐ Neil, 2026-08-18: *"if we've placed other traits, it should be highlighted in the beats."*
       A ported trait lands as a line of prose inside the beat ("Values (Creativity): I would say at
       the start…"), so once two or three are in, the beat reads as a wall and the student cannot
       see at a glance what is already there — or which of their eight traits they have spent. The
       `worked` map already carries EVERY roster trait per beat (wml-assessment.js builds it by
       scanning the live row text), so the data was there and only the display was missing.
       Chips name the VALUE and the TRAIT separately because that is the real hierarchy: the broad
       category is the value, the specific quality is the trait (Neil, same message). */
    const traitById = useMemo(() => {
        const m = {};
        (traits || []).forEach((t) => { m[t.id] = t; });
        return m;
    }, [traits]);

    useEffect(() => {
        if (!onStateChange) return;
        onStateChange({ picks, noShow, phase, band, cursor, ported });
    }, [picks, noShow, phase, band, cursor, ported]);   // eslint-disable-line react-hooks/exhaustive-deps

    /* ⭐ EVERY COUNT IS BAND-SCOPED. `picks` stays keyed by traitId — the ENGINE resolves which
       half's words to file from the BEAT's own band (see port() in wml-assessment.js), so the
       payload contract is unchanged — but the SCREEN must never tell a student that a trait is
       done in the end pass because they placed it at the beginning. The band of a pick is derived
       from the stage that owns the beat; nothing new is stored. */
    const bandOfBeat = (fid) => {
        for (let i = 0; i < stages.length; i++) {
            if ((stages[i].beats || []).some((b) => b.id === fid)) return stages[i].band;
        }
        return null;
    };
    const picksIn = (id, b) => (picks[id] || []).filter((fid) => bandOfBeat(fid) === b);
    const noShowKey = (id, b) => id + '|' + b;
    const isNoShow = (id, b) => noShow.indexOf(noShowKey(id, b)) !== -1 || noShow.indexOf(id) !== -1;
    const pickCount = (id) => picksIn(id, band).length;
    const placedCount = chosen.filter((t) => pickCount(t.id) > 0 || isNoShow(t.id, band)).length;
    const totalPicked = (traits || []).reduce((n, t) => n + ((picks[t.id] || []).length), 0);

    /* ── phase 1: which traits ── */

    /* ── phase 2: which beats, one trait at a time (§18 serial) ── */
    const bandsOf = (t) => BAND_ORDER.filter((b) => (t.bands || BAND_ORDER).indexOf(b) !== -1);
    // id → beat, for the rail's running list of picks (#383).
    const beatById = (id) => {
        for (let i = 0; i < stages.length; i++) {
            const hit = (stages[i].beats || []).filter((b) => b.id === id)[0];
            if (hit) return hit;
        }
        return null;
    };
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
    /* "It doesn't show anywhere yet" is now PER HALF: a trait can be absent at the beginning and
       land squarely at the end — that IS the shape of a character arc, so a single trait-level
       flag would have been a lie in one of the two passes. Only THIS band's picks are cleared. */
    const sayNoShow = (t) => {
        setPicks((prev) => {
            const out = Object.assign({}, prev);
            const keep = (prev[t.id] || []).filter((fid) => bandOfBeat(fid) !== band);
            if (keep.length) out[t.id] = keep; else delete out[t.id];
            return out;
        });
        setNoShow((prev) => (prev.indexOf(noShowKey(t.id, band)) !== -1 ? prev : prev.concat([noShowKey(t.id, band)])));
        setHint('');
        nextTrait();
    };
    // The hand-over Neil described in as many words: finish the beginning, then be SHOWN the end
    // traits before placing them. A band nobody has traits for is skipped entirely.
    const nextBandAfter = (b) => {
        const i = bandsWithTraits.indexOf(b);
        return i !== -1 && i + 1 < bandsWithTraits.length ? bandsWithTraits[i + 1] : null;
    };
    const nextTrait = () => {
        if (cursor + 1 < chosen.length) { setCursor(cursor + 1); scrollTop(); return; }
        const nb = nextBandAfter(band);
        if (nb) { setBand(nb); setCursor(0); goPhase(1); return; }
        goPhase(3);
    };
    const scrollTop = () => { if (scrollRef.current) scrollRef.current.scrollTo({ top: 0 }); };
    const goPhase = (n) => { setPhase(n); scrollTop(); };

    /* ── phase 3: review + port ── */
    // Grouped by BEAT, not by trait: what the student is about to change is a beat, and two traits
    // landing in the same beat must read as one change to that beat, not two unrelated rows.
    const review = useMemo(() => {
        const byBeat = new Map();
        // ALL traits, not `chosen` — `chosen` is one PASS now, and the review is the whole run.
        (traits || []).forEach((t) => {
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
    }, [traits, picks, stages]);

    const doPort = async () => {
        if (busy) return;
        setBusy(true);
        try {
            /* ALL traits across BOTH passes. The engine resolves which half's words to file from
               each BEAT's own band, so the payload shape is unchanged (port() in
               wml-assessment.js) — one entry per trait, every fid it landed in.
               `noShow` is band-scoped INTERNALLY (`id|band`), but the engine's build list is
               per TRAIT, so only a trait absent in every pass it appeared in is reported. */
            const allNoShow = (traits || [])
                .filter((t) => !((picks[t.id] || []).length)
                    && (t.bands || BAND_ORDER).every((b) => isNoShow(t.id, b)))
                .map((t) => t.id);
            const payload = {
                picks: (traits || [])
                    .filter((t) => (picks[t.id] || []).length > 0)
                    .map((t) => ({ traitId: t.id, trait: t.trait, label: t.label, portText: t.portText, fids: picks[t.id].slice() })),
                noShow: allNoShow,
            };
            const ok = await onPort(payload);
            if (ok) setPorted(true);
        } finally { setBusy(false); }
    };

    /* ── renderers ── */
    /* ⭐⭐ PASS INTRO (#401) — "here are your traits for the beginning". It REPLACES the old
       "which of your traits will you work on?" grid: the student is not choosing any more, they
       are being SHOWN what this half of the story has to carry, then taken through it one at a
       time. So every card here is a statement, not a control — no ticks, nothing to toggle, and
       nothing that can be left behind by accident (which is what the old screen quietly allowed:
       tap one, skip the rest, §18's whole argument). */
    const renderBandIntro = () => {
        const isBegin = band === 'begin';
        const n = chosen.length;
        const second = bandsWithTraits.length > 1 && bandsWithTraits.indexOf(band) > 0;
        return (
            <section className="phase is-live">
                <p className="eyebrow">{second ? 'Second half' : 'First half'} · {bands[band].sub}</p>
                <h2>{isBegin
                    ? <>Your traits at the <span className="pv-inline-trait">beginning</span></>
                    : <>Your traits at the <span className="pv-inline-trait">end</span></>}</h2>
                <p className="lead">
                    {isBegin
                        ? <>These are the {n} trait{n === 1 ? '' : 's'} you described at the <strong>START</strong> of your story in Step 7. You will place each one into the beats of <strong>{bands.begin.sub}</strong> — the opening half of your plot. <strong>Every one gets placed</strong>; if a trait genuinely does not show yet, you say so and it goes on your build list.</>
                        : <>Now the <strong>END</strong> of the story. These are the {n} trait{n === 1 ? '' : 's'} you described at the finish, and they go into <strong>{bands.end.sub}</strong> — the closing half of your plot. A trait you have already placed at the beginning appears again here, because <strong>how it ends is a different fact about your character</strong> from how it started.</>}
                </p>
                <div className="pv-trait-grid">
                    {chosen.map((t) => {
                        const bb = (t.byBand && t.byBand[band]) || null;
                        const placedHere = picksIn(t.id, band).length;
                        return (
                            <div key={t.id} className={'pv-trait-card is-static' + (placedHere ? ' is-sel' : '')}>
                                <span className="pv-t-main">
                                    <span className="pv-t-label">{t.label}</span>
                                    <span className="pv-t-value">{t.valueName}</span>
                                    <span className="pv-t-cond">{(bb && bb.cond) || t.cond}</span>
                                    {bb && bb.said
                                        ? <span className="pv-t-said">“{bb.said}”</span>
                                        : <span className="pv-t-said is-none">You didn’t write about this one at the {isBegin ? 'beginning' : 'end'} in Step 7 — we’ll mark the beat and you can write it in the chat.</span>}
                                    {placedHere
                                        ? <span className="pv-t-worked">Placed in {placedHere} beat{placedHere === 1 ? '' : 's'}</span>
                                        : t.workedIn
                                            ? <span className="pv-t-worked">Already in {t.workedIn} beat{t.workedIn === 1 ? '' : 's'}</span>
                                            : null}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {!chosen.length
                    ? <p className="hint">{(traits || []).length
                        ? <>Nothing came through from Step 7 for this half of the story — the other half is next.</>
                        : <>No flagged traits came through from Step 7 — go back and finish the values audit first.</>}</p>
                    : null}
            </section>
        );
    };

    /* ⭐⭐ #383 — THE TRAIT RAIL. Neil asked for this twice; the second time carried the argument
       that settles it: *"what's key as well is that the student's gonna have to READ the beats
       they're trying to place these into."* The beats are 2–4 lines of their own prose and must
       be read to be judged, so VERTICAL ROOM is the scarce resource on this screen — and a top
       bar spends exactly the resource the task needs. A side rail spends none of it.

       ⚠️ DELIBERATELY NOT `position: sticky`, and that is the whole point of the rewrite. The
       v7.20.523 bar was a sticky child INSIDE the scroller, and on Neil's screen it did not stay
       put. No ancestor carries an overflow/transform/contain that would explain it, so the cause
       was never established — and building a second thing on an unexplained mechanism is how you
       ship the same defect twice. This rail is a LAYOUT SIBLING of the scroller (see .pv-cols),
       so it is not in the scrolling box at all and cannot scroll away by construction. No sticky,
       no scroll listener, nothing to measure per frame.

       Narrow widths collapse it to a bar ABOVE the scroller — same element, same content, still
       outside the scroll box. That is the iPad-landscape case my earlier objection was really
       about, and it is a responsive fallback, not a second mechanism. */
    const renderRail = () => {
        const t = current;
        if (!t) return null;
        const n = pickCount(t.id);
        return (
            <aside className="pv-rail" aria-label="The trait you are placing">
                <p className="pv-rail-eyebrow">Placing · trait {cursor + 1} of {chosen.length}</p>
                {/* ⭐ Neil, 2026-08-18: *"that explanation needs to be pinned as well, so just above
                    the trait."* The question and the instruction lived only at the top of the
                    SCROLLER, so by the time a student had scrolled to beat #12 — which is exactly
                    when the task gets hard — the thing telling them what to do was off screen and
                    only the trait name remained. Same defect the rail was built to fix (#383), one
                    element higher up. Kept SHORT on purpose: at narrow widths this rail collapses
                    to a bar above the scroller, where every line costs the vertical room the beats
                    need to be readable. The body no longer repeats it. */}
                <h3 className="pv-rail-ask">Where does their <span className="pv-inline-trait">{t.label.toLowerCase()}</span> show?</h3>
                <p className="pv-rail-do">Tap <strong>every beat</strong> where a reader could actually SEE it. Your Step-7 words go <strong>underneath</strong> the beat — nothing you wrote is replaced.</p>
                <h3 className="pv-rail-trait">{t.label}</h3>
                {/* ⭐⭐ BOTH HALVES, LABELLED (Neil, 2026-08-18, watching a real student): Step 7
                    records a trait at the BEGINNING and again at the END, often at different
                    conditions and always in different words. This rail used to show one collapsed
                    state — the END pass — while the list below asked for BEGINNING beats, so the
                    student was matching her end-of-story description against her opening scenes.
                    A trait recorded at both ends is a JOURNEY, and showing the two states next to
                    each other is what makes that visible. */}
                {/* ⭐ v7.20.537 (#401): ONE HALF, because the pass is now one half. The rail used
                    to show the beginning and the end side by side, which was right when a single
                    screen mixed both — it is noise now, and worse, it re-invites the exact
                    confusion the two-pass split exists to remove. The other half gets its own
                    pass, with its own condition and its own words. */}
                <p className="pv-rail-halflabel">{band === 'begin' ? 'At the beginning' : 'At the end'}</p>
                <p className="pv-rail-cond">{(t.byBand && t.byBand[band] && t.byBand[band].cond) || t.cond}</p>
                {t.byBand && t.byBand[band] && t.byBand[band].said
                    ? <p className="pv-rail-said">“{t.byBand[band].said}”</p>
                    : <p className="pv-rail-said is-none">You didn’t write about this one at the {band === 'begin' ? 'beginning' : 'end'} in Step 7 — pick the beats where it should show.</p>}
                {/* The count climbs as they tap, which is what teaches the multi-select — he asked
                    whether a trait could go in more than one beat about a control that already
                    allowed it. */}
                <p className={'pv-rail-count' + (n ? ' is-on' : '')}>
                    {n ? <>{n} beat{n > 1 ? 's' : ''} picked</> : <>No beats picked yet</>}
                </p>
                {/* The running list — the other half of "I can't see what I'm doing". Once the
                    student has scrolled past a beat they tapped, the tick is gone from view too,
                    so the rail names them back. Tapping one removes it, which is the only place
                    a pick can be undone without hunting for the card again. */}
                {n
                    ? <ul className="pv-rail-picked">
                        {(picks[t.id] || []).map((id) => {
                            const b = beatById(id);
                            return (
                                <li key={id}>
                                    <button type="button" onClick={() => b && toggleBeat(t, b)}
                                        title="Remove this beat">
                                        <span className="pv-rail-x">✕</span>
                                        <span className="pv-rail-picked-label">
                                            {b ? <>#{b.ord} {b.label}</> : id}
                                        </span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                    : null}
                <p className="pv-rail-hint">A trait usually shows in more than one beat.</p>
            </aside>
        );
    };

    const renderPlace = () => {
        const t = current;
        if (!t) return null;
        const myBands = [band];   // #401: a pass places into ONE half of the plot, never both
        return (
            <section className="phase is-live">
                <p className="eyebrow">{band === 'begin' ? 'Beginning' : 'End'} · trait {cursor + 1} of {chosen.length}</p>
                {/* The question, the Step-7 quote and the instruction are all in the RAIL now, which
                    never scrolls away. Repeating them here would say everything twice and push the
                    beats — the thing being read — further down. */}
                <div className="pv-band-note">
                    {band === 'begin'
                        ? <>You are placing the <strong>beginning</strong> of the story, so only <strong>{bands.begin.sub}</strong> are open. The end of your story gets its own pass after this one.</>
                        : <>You are placing the <strong>end</strong> of the story, so only <strong>{bands.end.sub}</strong> are open.{(t.bands || []).indexOf('begin') !== -1 ? <> You placed this trait at the beginning too — this is where it ends up.</> : null}</>}
                </div>
                <div className="pv-tools">
                    <button type="button" className={'chip-btn' + (emptyOnly ? ' is-on' : '')}
                        onClick={() => setEmptyOnly(!emptyOnly)}>
                        {emptyOnly ? '✓ Showing empty beats only' : 'Show empty beats only'}
                    </button>
                    <span className="pv-tools-note">Empty beats are fine to pick — filling them in is part of this step.</span>
                </div>
                {/* #383: the trait now lives in the RAIL beside this list (see renderRail), which
                    is outside the scroller entirely — so it cannot scroll away and nothing here
                    needs to repeat it. */}
                {myBands.map((band) => {
                    const inBand = stagesInBand(band);
                    return (
                        <div className="pv-band" key={band}>
                            <div className="pv-band-head">
                                <span className="pv-band-label">{bands[band].label}</span>
                                <span className="pv-band-sub">{bands[band].sub}</span>
                                {/* The words that will actually be written into a beat in THIS half,
                                    beside the beats themselves — the rail can be scrolled past on a
                                    narrow screen, and this is the text that lands in the document. */}
                                {t.byBand && t.byBand[band] && t.byBand[band].cond
                                    ? <span className="pv-band-cond">{t.byBand[band].cond}</span>
                                    : null}
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
                                                const placed = Object.keys(b.worked || {})
                                                    .map((id) => traitById[id])
                                                    .filter(Boolean);
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
                                                            {/* ⭐ v7.20.538 (Neil, 2026-08-19): *"can we have a clear
                                                                indication that a trait has actually been placed in a
                                                                beat?"* THREE states now say themselves in words, because
                                                                a tick alone does not distinguish them:
                                                                  · ALREADY IN — filed by a previous run, the words are
                                                                    literally in the beat text above.
                                                                  · WILL BE ADDED — picked in this session, not yet
                                                                    written (the port happens at the end).
                                                                  · nothing — untouched.
                                                                ⚠️ The chip's condition is BAND-SCOPED. It read `m.cond`,
                                                                the collapsed value, so a beat in Stages I–III could
                                                                display "Curiosity in balance" while the rail beside it
                                                                said "IN DEFICIT" for the same trait — the .534 band
                                                                collapse surviving in one last place. */}
                                                            {already || on || placed.length
                                                                ? <span className="pv-placed">
                                                                    {already
                                                                        ? <span className="pv-placed-state is-in">✓ {t.label} is already in this beat</span>
                                                                        : on
                                                                            ? <span className="pv-placed-state is-add">＋ {t.label} will be added here</span>
                                                                            : null}
                                                                    {placed.map((m) => {
                                                                        const mb = (m.byBand && m.byBand[band]) || null;
                                                                        return (
                                                                            <span key={m.id}
                                                                                className={'pv-placed-chip' + (m.id === t.id ? ' is-current' : '')}>
                                                                                <span className="pv-placed-value">{m.valueName}</span>
                                                                                <span className="pv-placed-trait">{m.label}</span>
                                                                                <span className="pv-placed-cond">{String((mb && mb.cond) || m.cond || '').toLowerCase()}</span>
                                                                            </span>
                                                                        );
                                                                    })}
                                                                </span>
                                                                : null}
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
                                <span className="pv-r-line">Values ({t.label}): {
                                    /* per BEAT, because a journey trait files different words into
                                       each half — the review must show what will really land. */
                                    (() => {
                                        /* the BAND lives on the stage, which is what this row is
                                           grouped by — a beat card carries no band of its own. */
                                        const bb = t.byBand && t.byBand[stage.band];
                                        return (bb && bb.said) || t.portText;
                                    })()
                                }</span>
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
                    <span>{Array.from(new Set(noShow.map((k) => String(k).split('|')[0])))
                        .map((id) => (traits.filter((t) => t.id === id)[0] || {}).label).filter(Boolean).join(' · ')} — not in the story yet. That is not a failure: it names exactly what your next drafts have to add.</span>
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
        statusNode = chosen.length
            ? <><strong>{chosen.length} trait{chosen.length > 1 ? 's' : ''}</strong> at the {band === 'begin' ? 'beginning' : 'end'} — you’ll place them one at a time.</>
            : 'Nothing came through from Step 7 for this half.';
        nextLabel = chosen.length
            ? (band === 'begin' ? 'Place these in the beginning' : 'Place these in the end')
            : 'Continue';
        nextDisabled = !chosen.length;
    } else if (phase === 2) {
        const n = pickCount(current ? current.id : '');
        statusNode = n
            ? <><strong>{n} beat{n > 1 ? 's' : ''}</strong> for {current.label} — a trait usually shows in more than one.</>
            : <>Tap the beats where a reader could see their {current ? current.label.toLowerCase() : 'trait'} — or say it doesn’t show yet.</>;
        nextLabel = cursor + 1 < chosen.length
            ? 'Next trait'
            : (nextBandAfter(band) ? 'Now the end of your story' : 'Check it over');
        nextDisabled = false;
    } else {
        statusNode = ported
            ? <>Done — <strong>{totalPicked} line{totalPicked === 1 ? '' : 's'}</strong> filed under your beats.</>
            : <><strong>{totalPicked}</strong> beat{totalPicked === 1 ? '' : 's'} to add to, across both halves of your plot.</>;
        nextLabel = ported ? 'Back to my lesson' : 'Add to my beats';
        nextDisabled = busy || (!ported && !review.length && !noShow.length);
    }

    return (
        <div className="ssi-frame">
            {/* #383: the scroller and the trait rail are SIBLINGS in a row. The rail is outside
                the scrolling box, so it cannot scroll away — no sticky involved. */}
            <div className="pv-cols">
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
                        {[['1', band === 'begin' ? 'Beginning traits' : 'End traits'],
                          ['2', band === 'begin' ? 'Beginning beats' : 'End beats'],
                          ['3', 'Check it over']].map(([n, label]) => {
                            const k = +n;
                            const live = k === phase;
                            const done = k < phase;
                            const disabled = (k === 2 && !chosen.length);
                            return (
                                <button type="button" key={k} disabled={disabled && k > phase}
                                    className={'step-pill' + (live ? ' is-live' : '') + (done ? ' is-done' : '')}
                                    onClick={() => { if (!(disabled && k > phase)) goPhase(k); }}>
                                    <span className="n">{n}</span> {label}
                                </button>
                            );
                        })}
                    </div>
                    {phase === 1 ? renderBandIntro() : null}
                    {phase === 2 ? renderPlace() : null}
                    {phase === 3 ? renderReview() : null}
                </div>
            </div>
            {phase === 2 ? renderRail() : null}
            </div>
            <div className="actionbar">
                <div className="actionbar-in">
                    <span className="status">{statusNode}</span>
                    {phase > 1 && !ported
                        ? <button type="button" className="btn" onClick={() => {
                            if (phase === 3) {
                                const last = bandsWithTraits[bandsWithTraits.length - 1] || band;
                                setBand(last);
                                setCursor(Math.max(0, traitsInBand(last).length - 1));
                                goPhase(2); return;
                            }
                            if (cursor > 0) { setCursor(cursor - 1); scrollTop(); return; }
                            if (phase === 2) { goPhase(1); return; }
                            // phase 1 of the SECOND pass steps back into the first pass's last trait
                            const i = bandsWithTraits.indexOf(band);
                            if (i > 0) {
                                const prev = bandsWithTraits[i - 1];
                                setBand(prev);
                                setCursor(Math.max(0, traitsInBand(prev).length - 1));
                                goPhase(2);
                            }
                        }}>Back</button>
                        : null}
                    <button type="button" className="btn primary" disabled={nextDisabled}
                        onClick={() => {
                            if (phase === 1) {
                                if (!chosen.length) {   // an empty half is skipped, never a dead screen
                                    const nb = nextBandAfter(band);
                                    if (nb) { setBand(nb); setCursor(0); goPhase(1); return; }
                                    goPhase(3); return;
                                }
                                goPhase(2); setCursor(0); return;
                            }
                            if (phase === 2) { nextTrait(); return; }
                            if (ported) { onClose(); return; }
                            doPort();
                        }}>{nextLabel}</button>
                </div>
            </div>
        </div>
    );
}
