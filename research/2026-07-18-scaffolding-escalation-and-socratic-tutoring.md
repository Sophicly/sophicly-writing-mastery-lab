# Scaffolding Escalation & Socratic Tutoring — Research Basis for the Planning Ladder
**Date:** 2026-07-18 · **For:** the WML planning-protocol scaffolding ladder (applied design in `PLANNING-PROTOCOL-AUDIT-AND-PLAN-2026-07-18.md` §2).
**Question:** how hard do we push a student to think before we help, what do the scaffolding levels look like, and how does even the weakest student get unstuck without endless frustrating questioning?

---

## 1. Contingent scaffolding + fading (the spine)
- **Wood, Bruner & Ross (1976)** — coined "scaffolding": the tutor controls the parts of the task the learner can't yet manage so they concentrate only on what's within reach.
- **Wood & Middleton (1975); Wood, Wood & Middleton (1978)** — the **contingent-shift principle**: after a learner **fails**, the next tutor move gives **more** control/specificity; after a **success**, **less**. Tutors who followed this produced the best learning. → the empirical warrant for "**increase help only after a failed attempt at the current level; step back down on success.**"
- **van de Pol, Volman & Beishuizen (2010)** (Educ. Psych. Review — the standard review) — three necessary features: **contingency** (help calibrated to current understanding — the necessary condition; unresponsive help isn't scaffolding), **fading** (gradual withdrawal), **transfer of responsibility** (the endpoint). Help is a dial turned UP on failure, DOWN on success, and deliberately withdrawn as competence appears.

## 2. Zone of Proximal Development
- **Vygotsky (1978)** — the ZPD is the gap between solo ability and guided ability. Aim help *just beyond* independent ability → **start at the lowest-assistance rung still inside the ZPD** (an open prompt); descend toward giving only when responses show the task has fallen outside it.

## 3. Intelligent Tutoring Systems — hint escalation + the assistance dilemma
- **Koedinger & Aleven (2007), "Exploring the Assistance Dilemma"** — the canonical framing (a.k.a. the **"Goldilocks zone"**): **too little help → floundering/frustration; too much → shallow processing, reduced effort/self-regulation.** Optimal learning at an **intermediate** point; empirically **mid-level (partial) assistance beat both** full worked examples and unaided problem-solving. → the middle rungs (hint/options) are where learning happens.
- **VanLehn (2011)** meta-analysis — step-based ITS (d≈0.76) rival human tutors (d≈0.79). **VanLehn (2006)** — outer task-loop + inner step-loop; each stuck step triggers a **graded hint sequence** ending in a "bottom-out" hint. Norm: a small ladder of **2–4 hints per step**, most specific last.
- **Graesser et al. — AutoTutor (Expectation & Misconception-Tailored dialogue)** — the model most directly mappable to a CHAT tutor. Per target idea, escalate through ordered dialogue moves: **PUMP ("what else?") → HINT (points at the idea) → PROMPT (cues the missing word) → ASSERTION (states it)**. Climbs one move at a time; only ASSERTS after prompts fail. → a validated 4-rung escalation for eliciting an idea through conversation.
- **Aleven & Koedinger (help-seeking)** — the critical warning: students **abuse hints**, drilling to the bottom-out answer; **~72% of help-seeking actions were unproductive** (abuse OR help-avoidance). → (a) don't make the answer trivially reachable; (b) require a genuine attempt to advance; (c) the earliest hint must provoke thinking, not hand over content.
- **Productive struggle vs. unproductive frustration** — **D'Mello & Graesser** (confusion drives learning); **Kapur (productive failure)** (struggle-then-instruction beats instruction-first for retention/transfer). But UNRESOLVED confusion → frustration → boredom → disengagement. → **time-box the struggle; guarantee resolution before frustration sets in.** The ladder is the mechanism that keeps struggle productive.

## 4. Worked-example / completion effect — why lower rungs give MODEL/OPTIONS to novices
- **Sweller & Cooper (1985); Renkl (1997/2002)** — the **worked-example effect**: for **novices**, studying a worked model beats open problem-solving (open solving imposes extraneous load that crowds out schema-building). An open Socratic question can exceed a weak student's working memory → they produce nothing.
- **Kalyuga et al. — expertise-reversal effect** — the same worked support that helps novices **harms** experts. → support must **fade** as competence grows; a strong student gets the open prompt, a weak one the model.
- **van Merriënboer; Renkl — completion effect** — the empirically preferred *bridge*: a **partially-completed** solution to finish. → the research basis for the "options" and "near-give" rungs: a completion/recognition task, not open recall.

## 5. The escalation ladder (synthesised)
Four rungs, mirroring AutoTutor's EMT sequence, for one planning element:
1. **Open Socratic prompt** (PUMP) — ZPD start-low; productive struggle. → escalate on 1 failed/empty/off-track attempt.
2. **Focused hint** (HINT) — add specificity (contingent shift; mid-assistance optimal). → on 1 further failure.
3. **Options / recognition** (completion effect; recognition < recall load). → on wrong pick or "I don't know".
4. **Near-give worked model → apply to a fresh instance** (bottom-out; ASSERTION; worked→completion→transfer). Resolution guaranteed; then FADE back up.

**Escalation:** the purest reading is **contingent, turn-by-turn — one rung per failed attempt** (Wood's contingent shift; AutoTutor's move-by-move climb) → a resolving rung in **~2–4 turns per element** (AutoTutor's envelope). A fixed "~3 attempts then give" is a **defensible engineering approximation** *provided each attempt actually shifts the help level* (a stalled student must see the rung change, not the same question reworded — else frustration + hint-abuse). **One attempt per rung; ~4 turns to resolution; the number matters less than the responsiveness.**

**Low-ability guarantee:** the options + worked-model rungs convert an impossible RECALL task into an achievable RECOGNITION/completion task, so a struggling student **produces something** even when open generation is impossible (mid-assistance sweet spot; worked-example/novice case). Productive-failure effects hold across ability **when the task is calibrated** — the ladder is that calibration. **Fade** (van de Pol; expertise-reversal): start the next element one rung above where they resolved. **Anti-abuse** (Aleven & Koedinger): gate each rung behind a real attempt; make the bottom rung APPLY, never just reveal.

---

## 6. ⭐ APPLIED CORRECTION (Fable review, 2026-07-18) — ownership makes "options" a LANDMINE
The generic research ladder says "offer candidate answers (options)." In OUR domain that **breaks the Ownership Law** (the student must own the ideas). So the applied ladder splits the generic "options" rung:
- **L3 = a LENS/ANGLE menu, not a readings menu.** Offer *angles to think through* ("attitude / who's affected / wider implication"), never candidate readings of *this* text. Student picks the lens, still generates the idea. **Method-menus are sanctioned; content-menus (a reading of THIS text) are injection.**
- **L4 = a worked model on an UNRELATED instance,** then the student applies the *method* to their own material (their application is what counts). Never model on their actual quote/text.
This keeps the completion-effect benefit (bounded search space) without handing over the answer. It is the single most important adaptation of the general research to an ownership-first tutor. (Full applied design + the two-regime split + the code-owned state machine: the plan doc §2, §7.)

**Key citations:** Wood, Bruner & Ross (1976); Wood & Middleton (1975)/Wood et al. (1978); Vygotsky (1978); van de Pol, Volman & Beishuizen (2010); Koedinger & Aleven (2007); VanLehn (2006, 2011); Graesser et al. (AutoTutor EMT); Aleven & Koedinger (help-seeking/hint-abuse); Sweller & Cooper (1985); Renkl (1997/2002); Kalyuga et al. (expertise-reversal); van Merriënboer (completion effect); Kapur (productive failure); D'Mello & Graesser (confusion & learning).

---
*Context/concept-driven-interpretation research (prior-knowledge activation, knowledge-rich reading, generative learning) → separate doc `2026-07-18-context-knowledge-and-concept-driven-interpretation.md` (in progress).*
