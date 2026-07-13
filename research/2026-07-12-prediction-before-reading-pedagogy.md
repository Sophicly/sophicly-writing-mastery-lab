# Prediction-Before-Reading Pedagogy — Research Findings (P2 Planning §10a / D2)

**Date:** 2026-07-12
**Method:** deep-research harness — 5 search angles, 22 sources fetched, 79 claims extracted,
25 verified by 3-vote adversarial panels → 21 confirmed, 4 refuted, 0 unverified.
**Purpose:** settle the D2 prediction-thread design for the AQA Lang P2 planning protocol
(brief: `~/.claude/handoffs/open/wml-PLANNING-P2-design-brief-2026-07-12.md` §5, §10a).

---

## VERIFIED FINDINGS

### F1 — Prediction before reading works, and the ATTEMPT is the mechanism (HIGH, 3-0)
Generation effect d = .40 (Bertsch et al. 2007 meta-analysis; 86 studies, 17,711 subjects).
Pretesting before reading beats even longer extra study time — d up to 1.1 — despite ~95% of
pre-reading answers being WRONG (Richland, Kornell & Kao 2009: pretested 75% vs extended-study
56%). Attempting prequestions (90%) beat memorising the same questions without answering (78%),
isolating the active-attempt mechanism. Prequestion-specific learning g = .66 (King-Shepard
et al. 2025 meta-analysis).
- Bertsch et al. 2007, *The generation effect: a meta-analytic review*
- Richland, Kornell & Kao 2009, JEP:Applied — learninglab.uchicago.edu/Pre-Testing_files/RichlandKornellKao.pdf
- King-Shepard et al. 2025 — link.springer.com/article/10.1007/s10648-025-10075-7

### F2 — Benefit is SPECIFIC to the predicted targets; near-zero general transfer (HIGH, 3-0)
Two independent meta-analyses converge: predicted/prequestioned content g = .66/.54; NON-predicted
material g = .01/.04 (essentially nothing). Benefit strongest when the text later supplies a
locatable answer; weak for complex-inference targets not stated in one place.
**Design implication:** predictions must target content the sources actually deliver; prediction
alone will not lift whole-source comprehension.
- link.springer.com/article/10.1007/s10648-025-10075-7 (2025)
- link.springer.com/article/10.1007/s10648-023-09814-5 (Educational Psychology Review 2023)

### F3 — Wrong predictions are the learning signal, not failure (HIGH, 3-0)
Trying and failing to predict enhances later recall RELATIVE TO studying the correct answer
directly (Yan, Yu, Garcia & Bjork 2014, Memory & Cognition). Wrong attempts create "fertile
ground" encoding (Richland/Kornell/Kao). Confirmed/predictable content can even be processed
LESS thoroughly (Rommers 2021 — predictable-word memory disadvantage); prediction error
furnishes richer traces.
**Design implication:** overturned predictions are the HIGH-VALUE moment. Elaborate on them
more than on confirmed ones. Never gloss over, never frame as failure.

### F4 — ⭐ The benefit is CONDITIONAL on meeting the answer afterwards — the REVISIT is the feedback (HIGH, 3-0)
The load-bearing finding. Corrective resolution is "essential" — errors are not spontaneously
corrected without it (Psychonomic Bulletin & Review 2021). Retrieval+feedback corrected false
memories far better than restudy+feedback (M=0.95 vs 0.63, η²p=0.32 — large; Rodrigues et al.
2022, PLOS ONE). Prequestions+feedback beat prequestions alone (King-Shepard 2025).
**Design implication:** capture-only prediction leaves most of the value on the table. The
resurfacing touchpoint — reading the source, then "what confirmed/overturned it?" — is NOT
optional polish; it IS the feedback step that unlocks the prediction-error benefit.

### F5 — Elaborated reflection beats bare noticing (MEDIUM — directional)
Reflective prompts (challenge assumptions, connect evidence to outcome) significantly improved
objective understanding and drove more proactive information-seeking vs passive following
(Zhang, Yan & Suzuki, CHI 2025 — N=16, AR procedural tasks, adults; domain-mismatched, treat
as directional). Direction reinforced by F1/F3 (effortful generative engagement is what pays)
and by self-explanation meta-analysis g = .55 (Bisra et al. 2018, 64 studies).
**Design implication:** "what in the text confirmed or overturned it?" — never a bare yes/no
"were you right?".

### F6 — Never score or gamify prediction accuracy for this age group (HIGH, 3-0)
Low-performing students did NOT become less confident in erroneous predictions over a semester
of tracked feedback; calibration feedback can even increase their overconfidence (J.
Intelligence 2023). Calibration is trainable overall (g = .565; 56 effect sizes, 7,667
participants) but the effect is significantly smaller for younger learners.
**Design implication:** Neil's instinct CONFIRMED — commit predictions, never mark right/wrong,
no accuracy score, no calibration widget for predictions. Surface for reflection only.

### F7 — Benefit GROWS with delay → spaced touchpoints (HIGH, 3-0)
Generation-effect size by retention interval: <1 min d=.32 → 1 min–1 day d=.41 → >1 day d=.64
(Bertsch 2007). Plus F4's feedback-dependency: jointly argue for AT LEAST TWO spaced revisits —
one at the point the text answers the prediction, one at session end.

## REFUTED (verifier panels killed — do not cite)
- "Prediction error during reading enhances later episodic memory" (Rommers reading-time claim
  as stated) — 0-3.
- "Errorful-generation advantage driven by motivation, not surprise" — 0-3.
- Two over-broad restatements of the pretesting effect — 1-2 each.
**Rationale-note guard:** do NOT claim surprise/prediction-error is the SOLE mechanism —
deep/generative processing is a co-mechanism.

## CAVEATS (honest limits)
- **Construct gap (biggest):** evidence base is prequestions/guessing with re-tested items and
  single correct answers — NOT open-ended theme predictions never marked. Extrapolation is
  mechanism-consistent but not directly measured.
- **Age gap:** mostly undergraduates; 13–16 band not isolated. Directional.
- **F5 rests on one small domain-mismatched study** — directional only.
- No verified source quantifies the OPTIMAL touchpoint count; mid-session prediction-UPDATING
  vs end-review was never directly compared → design judgement (ruled in the brief's design
  section).
