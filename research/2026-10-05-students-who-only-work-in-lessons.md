# Students who only work in lessons: what the research says, and what to do

**Date:** 5 October 2026 · **Asked by:** Neil, dashboard FIXLIST #438 (`~/.claude/handoffs/open/dashboard-FIXLIST.md:535`)
**The case:** student "M", Gold. The facts are the ones measured on 5 Oct and given in the brief; nothing was
re-measured. Her name is left out of this file on purpose, and the drafts in §5 use [Name].
**Built on (read first, cited by line):** the REMINDERS handoff, four research files, the parent nurture research of
30 Sep, and the no-grade memory. Full paths and line numbers are in §6.

---

## §1 The answer in five sentences

1. Awareness is probably not the problem: knowing changes behaviour far less than a plan and a structure do, and our
   reminders have already failed.
2. Her pattern fits weak self-management outside lessons or avoiding judgement, and one question in a 1-to-1 can show
   which.
3. This week, use Tuesday's booked session to choose one short piece and a time to write, then mark the piece within
   days.
4. For students like this, a weekly check (lessons attended, no other work, nothing marked in 28 days) should book the
   session, alert Abdullah and text the parent once, with no reminders, points or streaks.
5. Tell the parent the fact, the plan and one job: specific news about missing work changes what families do, and
   general advice does not.

---

## §2 What the evidence says

| # | Claim | Evidence | Strength |
|---|---|---|---|
| 1 | Telling her more will not work | Raising intention moves behaviour about half as much [1]; students study 5–8 hours a week less than planned [2]; weekly texts to UK GCSE resit students: no effect [3]; our reminders failed (REMINDERS :16–23) | **Strong** |
| 2 | Likely causes: self-management, fear of judgement | Self-regulation predicts grades, modestly [4]; delay follows unpleasant tasks and low confidence [5]; teenagers hold back help-seeking and effort when failure feels risky [6][7] | **Moderate**, correlational |
| 3 | Work between lessons matters; quality beats hours | Homework +5 months at secondary, "very limited evidence" [8]; UK: 2–3 hours a night, about 10 times the odds of five A*–C, correlational [9][10] | **Moderate** |
| 4 | The marked piece is the active ingredient | Feedback +6 months [11]; success at near goals builds confidence [12][13]; "high standards, and I know you can meet them" raised essay revision [14]; 8 of 8 new students ungraded (no-grade memory :11–18) | **Strong** for feedback |
| 5 | A plan made in a booked 1-to-1 beats a message | When-and-where plans: d = .65 [15], also in teenagers [16], best face to face [17], and only with a time [18]; coaching beat texts [19]; automatic sign-up 95% vs opt-in under 1% [20]; mentoring alone fades [21] | **Moderate**, small samples |
| 6 | Parents: specific news helps; homework help does not | Missed-work alerts cut course failures 27% [22]; parents over-estimate effort [23]; "what to improve" worked best [24]; UK: +1 month maths [25]; parents should talk about plans and set a time, not teach [26][27][28] | **Strong** for behaviour, **weak** for grades |

**Not used:** the well-known "deadlines" study, retracted in September 2026 [29]. **Not found** (searches in §6): trials of
lesson-only students, of paid tutoring, or of if-then plans in GCSE English.

---

## §3 For M, this week

1. **Today, dashboard lane:** confirm her Tuesday 17:30 seat and the automatic booking texts (FIXLIST :534, :503). If
   her lesson starts at the same time, agree how she moves between rooms.
2. **Today, Abdullah:** send §5a and the §5b text. No "you need to focus" message: feedback aimed at the person can
   lower performance (help-seeking file :17).
3. **Tuesday, Abdullah, one step at a time:** one real strength · ask *"When you sit down to write at home, what
   happens?"* · fix what she names (unclear task: a worked example; no time or quiet space: set both; fear of
   the mark: "the first mark is a start"; too big: a smaller piece) · one piece she can finish in one sitting · her
   plan: *"On [day] at [time], at [place], I will … If [problem], then I will …"* · book the next session.
4. **After Tuesday, Abdullah:** the §5b email. Mark within three days: one strength, one next step.
5. **Missed session or hand-in:** Abdullah phones the parent.

---

## §4 For students like this: the smallest system

- **Detect, Mondays at 08:00** (Gold/Platinum, real students): 2 or more lessons in 14 days, no work on other days,
  nothing marked in 28 days. Count the matches first. (The first run of the booking rule, 5 Oct, picked 30 students, and 26 of them had finished. Tracker 1.19.39 now limits it to current group members, FIXLIST #432.)
- **Act:** book the usual day (the built `not_booked` rule: ON since 5 Oct, current group members only since tracker 1.19.39); list the name and reason for Abdullah
  (queued staff list, FIXLIST :333); he runs the §3 session. Flag-and-assign systems cut school absence [30].
- **The student gets** the seat (movable), their own plan on the dashboard and a marked piece within days.
- **The parent gets** one specific text when the check fires, then the marked piece. At most one message a week.
- **Escalate:** a missed hand-in or two missed sessions puts the family on Abdullah's call list (built).
- **Done** when a piece is marked. Measure the share marked within 14 days.

---

## §5 Draft wording

**(a) To M, from Abdullah** (dashboard or Sophicly email):

> Hi [Name], I have booked a strategy session for you with me on Tuesday 6 October at 17:30. The session lasts 10 to 15
> minutes. You come to your lessons, and you work in your lessons. Your next step is one piece of writing for me to
> mark. I mark to a high standard, because I know you can reach that standard. Your first marked essay is a starting point,
> not a final grade. On Tuesday we will choose the piece, and a day and a time for you to write. Abdullah

**(b) Parent text, today** (264 characters). ⚠️ Dashboard lane, 5 Oct: booking her already sends the parent an automatic email AND text. Send this one only if it replaces those; otherwise put its last line into the email after Tuesday (at most one message a week, §4):

> Hello, this is Abdullah from Sophicly. I have booked a strategy session for [Name] with me on Tuesday 6 October at
> 17:30. We will plan [Name]'s first piece of writing for me to mark. After Tuesday, please ask [Name]: "Which day and
> time did you choose?" Thank you.

**(b) Parent email, after Tuesday** (fill the brackets from the plan):

> **Subject:** [Name]'s plan for her next piece of writing
>
> Hello [Parent's name],
>
> On Tuesday, [Name] and I made a plan. [Name] has not yet handed in a piece of writing for marking. A marked piece
> shows [Name], you and me what to improve next.
>
> [Name] will write on [day] at [time]. [Name] will hand in the piece by [date]. I will mark the piece within three
> days. The mark and my comments will be in your parent report.
>
> Please make sure [Name] has a quiet place to write on [day] at [time]. You do not need to check the writing.
> Marking is my job.
>
> When the mark arrives, please ask [Name] to show you one comment. Reply to this email with any question.
>
> Abdullah, Sophicly

---

## §6 Sources

**Verification key:** ✅ = resolved and the abstract (or the official page) read on 5 Oct 2026 · ⚠️ = resolved, but
the claim rests on a summary, a capture or our own earlier file · ⛔ = do not cite.

**Literature**

1. ✅ Webb, T. L. & Sheeran, P. (2006). Does changing behavioral intentions engender behavior change? A meta-analysis
   of the experimental evidence. *Psychological Bulletin*, 132(2), 249–268. doi:10.1037/0033-2909.132.2.249 — 47
   experiments: intention d = 0.66 → behaviour d = 0.36.
2. ✅ Oreopoulos, P. & Petronijevic, U. (2019). *The Remarkable Unresponsiveness of College Students to Nudging and What
   We Can Learn from It.* NBER Working Paper 26059. doi:10.3386/w26059 · https://www.nber.org/papers/w26059 — about
   25,000 university students; no intervention changed academic outcomes; students study 5–8 hours a week less than
   they plan. Population: Canadian university students.
3. ✅ Education Endowment Foundation (2020). *Texting Students and Study Supporters (Project Success)*, evaluated by
   NatCen. https://educationendowmentfoundation.org.uk/projects-and-evaluation/projects/texting-students-and-study-supporters
   — 3,779 students, 31 further-education settings, 36–37 weekly texts to students and/or a "study supporter"; no
   evidence of any effect on GCSE English or maths resit passes or attendance; high security; limitation: students
   opted in and were already motivated. ⚠️ Read through the Internet Archive (EEF returns HTTP 403 to automated reads).
4. ✅ Dent, A. L. & Koenka, A. C. (2016). The relation between self-regulated learning and academic achievement across
   childhood and adolescence: A meta-analysis. *Educational Psychology Review*, 28(3), 425–474.
   doi:10.1007/s10648-015-9320-8 — r = 0.20 (metacognitive processes), r = 0.11 (cognitive strategies).
5. ✅ Steel, P. (2007). The nature of procrastination: A meta-analytic and theoretical review of quintessential
   self-regulatory failure. *Psychological Bulletin*, 133(1), 65–94. doi:10.1037/0033-2909.133.1.65 — 691
   correlations; strong predictors: task aversiveness, task delay, self-efficacy, impulsiveness.
6. ✅ Ryan, A. M. & Pintrich, P. R. (1997). "Should I ask for help?" The role of motivation and attitudes in
   adolescents' help seeking in math class. *Journal of Educational Psychology*, 89(2), 329–341.
   doi:10.1037/0022-0663.89.2.329 — 203 pupils aged 12–14; perceived threats predicted avoidance of help.
   ⚠️ Ryan, A. M., Pintrich, P. R. & Midgley, C. (2001). Avoiding seeking help in the classroom: Who and why?
   *Educational Psychology Review*, 13(2), 93–114. doi:10.1023/A:1009013420053 — metadata resolved; abstract behind a
   paywall; the claim is taken from our 19 Aug file.
7. ✅ Schwinger, M., Wirthwein, L., Lemmer, G. & Steinmayr, R. (2014). Academic self-handicapping and achievement: A
   meta-analysis. *Journal of Educational Psychology*, 106(3), 744–761. doi:10.1037/a0035832 — 36 studies,
   N = 25,550; r = −.23 with achievement; a strategy "for regulating the threat to self-esteem elicited by the fear of
   failing".
8. ✅ EEF Teaching and Learning Toolkit, *Homework*: +5 months; "moderate impact for very low cost based on very
   limited evidence"; secondary +5, primary +3; 43 studies; review updated August 2021. Active ingredients include
   tasks linked to classroom learning, high-quality feedback, clear aims, addressing barriers ("access to a learning
   device", "a quiet space") and teaching independent learning; homework clubs named as a way past those barriers.
   https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/homework — ⚠️ read
   through the Internet Archive capture of 17 Sep 2026.
9. ✅ Sammons, P., Sylva, K., Melhuish, E., Siraj, I., Taggart, B., Toth, K. & Smees, R. (2014). *Influences on
   students' GCSE attainment and progress at age 16* (EPPSE). DfE Research Report RR352.
   https://assets.publishing.service.gov.uk/government/uploads/system/uploads/attachment_data/file/373286/RR352_-_Influences_on_Students_GCSE_Attainment_and_Progress_at_Age_16.pdf
   — PDF read. Year 9 students reporting 2–3 hours of homework a night were "almost 10 times more likely" to get five
   A*–C (OR = 9.97; Year 11: OR = 9.61), after background controls. Self-reported and correlational; the report says
   homework time "may also be … an indicator of self-regulation".
10. ✅ Cooper, H., Robinson, J. C. & Patall, E. A. (2006). Does homework improve academic achievement? A synthesis of
    research, 1987–2003. *Review of Educational Research*, 76(1), 1–62. doi:10.3102/00346543076001001 — consistent
    positive link, stronger in grades 7–12; all studies had design flaws.
11. ✅ EEF Toolkit, *Feedback*: +6 months; "high impact for very low cost based on extensive evidence"; 155 studies;
    effective feedback "provides specific information on how to improve".
    https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/feedback — ⚠️ Internet
    Archive capture of 27 Aug 2026.
12. ✅ Usher, E. L. & Pajares, F. (2008). Sources of self-efficacy in school: Critical review of the literature and
    future directions. *Review of Educational Research*, 78(4), 751–796. doi:10.3102/0034654308321456 — "mastery
    experience is typically the most influential source".
13. ✅ Bandura, A. & Schunk, D. H. (1981). Cultivating competence, self-efficacy, and intrinsic interest through
    proximal self-motivation. *Journal of Personality and Social Psychology*, 41(3), 586–598.
    doi:10.1037/0022-3514.41.3.586 — near sub-goals beat distant goals; distal goals had no effect. Children, arithmetic.
14. ✅ Yeager, D. S., Purdie-Vaughns, V., Garcia, J., Apfel, N. et al. (2014). Breaking the cycle of mistrust: Wise
    interventions to provide critical feedback across the racial divide. *Journal of Experimental Psychology: General*,
    143(2), 804–824. doi:10.1037/a0033906 — "wise feedback" raised the chance of submitting an essay revision; effects
    strongest for pupils who mistrusted school. Studies 1–2: US pupils aged 12–13.
15. ✅ Gollwitzer, P. M. & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis of
    effects and processes. *Advances in Experimental Social Psychology*, 38, 69–119.
    doi:10.1016/S0065-2601(06)38002-1 — 94 tests, d = .65. (Background: Gollwitzer, P. M. (1999), *American
    Psychologist*, 54(7), 493–503, doi:10.1037/0003-066X.54.7.493.)
16. ✅ Duckworth, A. L., Grant, H., Loew, B., Oettingen, G. & Gollwitzer, P. M. (2011). Self-regulation strategies
    improve self-discipline in adolescents: Benefits of mental contrasting and implementation intentions. *Educational
    Psychology*, 31(1), 17–26. doi:10.1080/01443410.2010.506003 — 66 high-school students; 60% more practice
    questions. Also ✅ Duckworth, A. L., Kirby, T. A., Gollwitzer, A. & Oettingen, G. (2013). From fantasy to action.
    *Social Psychological and Personality Science*, 4(6), 745–753. doi:10.1177/1948550613476307 — 77 pupils aged
    10–11; better report-card grades, attendance and conduct.
17. ✅ Wang, G., Wang, Y. & Gai, X. (2021). A meta-analysis of the effects of mental contrasting with implementation
    intentions on goal attainment. *Frontiers in Psychology*, 12, 565202. doi:10.3389/fpsyg.2021.565202 — 24 effect
    sizes; g = 0.336; face to face g = 0.465 vs on paper g = 0.277; some publication bias.
18. ✅ Milkman, K. L., Beshears, J., Choi, J. J., Laibson, D. & Madrian, B. C. (2011). Using implementation intentions
    prompts to enhance influenza vaccination rates. *PNAS*, 108(26), 10415–10420. doi:10.1073/pnas.1103170108 — date
    alone +1.5 points (not significant); date and time +4.2 points. Adults.
19. ✅ Oreopoulos, P. & Petronijevic, U. (2018). Student coaching: How far can technology go? *Journal of Human
    Resources*, 53(2), 299–329. doi:10.3368/jhr.53.2.1216-8439R — 4,000+ university students; large effects from
    one-to-one coaching, none from texts or an online exercise.
20. ⚠️ Bergman, P., Lasky-Fink, J. & Rogers, T. (2020). Simplification and defaults affect adoption and impact of
    technology, but decision makers do not realize it. *Organizational Behavior and Human Decision Processes*, 158,
    66–79. doi:10.1016/j.obhdp.2019.04.001 — abstract readable only as far as the opt-in result; the 95% / under 1%
    figures come from our nurture research (:336), not re-read.
21. ✅ EEF Toolkit, *Mentoring*: +2 months; "low impact for moderate cost based on moderate evidence"; effects "tend
    not to be sustained once the mentoring stops"; 64 studies.
    https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/mentoring — ⚠️ Internet
    Archive capture of 22 Aug 2026.
22. ✅ Bergman, P. & Chan, E. W. (2021). Leveraging parents through low-cost technology: The impact of high-frequency
    information on student achievement. *Journal of Human Resources*, 56(1), 125–158.
    doi:10.3368/jhr.56.1.1118-9837R1 — weekly alerts on missed work, grades and absences: course failures −27%,
    attendance +12%, no effect on state test scores; larger for lower-attaining students. US.
23. ✅ Bergman, P. (2021). Parent-child information frictions and human capital investment: Evidence from a field
    experiment. *Journal of Political Economy*, 129(1), 286–322. doi:10.1086/711410 — parents "have upwardly biased
    beliefs about their child's effort"; information on missed work raised achievement.
24. ✅ Kraft, M. A. & Rogers, T. (2015). The underutilized potential of teacher-to-parent communication: Evidence from
    a field experiment. *Economics of Education Review*, 47, 49–63. doi:10.1016/j.econedurev.2015.04.001 — weekly
    one-sentence messages; students failing to earn credit 15.8% → 9.3%; "what students could improve" messages had the
    largest effect. Also ✅ Kraft, M. A. & Dougherty, S. M. (2013), *Journal of Research on Educational Effectiveness*,
    6(3), 199–222, doi:10.1080/19345747.2012.743636 — daily contact raised the odds of homework completion by 40%.
25. ✅ Miller, S., Davison, J., Yohanis, J., Sloan, S., Gildea, A. & Thurston, A. (2016). *Texting Parents: Evaluation
    report and executive summary.* EEF. https://files.eric.ed.gov/fulltext/ED581121.pdf — 36 English secondary schools,
    15,697 pupils in Years 7, 9 and 11, about 30 texts; about +1 month in maths, less absence. Abstract read at
    https://pure.ulster.ac.uk/en/publications/texting-parents-evaluation-report-and-executive-summary/
26. ✅ Hill, N. E. & Tyson, D. F. (2009). Parental involvement in middle school: A meta-analytic assessment of the
    strategies that promote achievement. *Developmental Psychology*, 45(3), 740–763. doi:10.1037/a0015362 — 50
    studies; involvement linked to achievement "with the exception of parental help with homework"; academic
    socialisation strongest.
27. ✅ Patall, E. A., Cooper, H. & Robinson, J. C. (2008). Parent involvement in homework: A research synthesis.
    *Review of Educational Research*, 78(4), 1039–1101. doi:10.3102/0034654308325185 — rule-setting had the strongest
    link; a negative link for middle-school pupils overall.
28. ✅ EEF Toolkit, *Parental engagement*: +4 months; "moderate impact for very low cost based on extensive evidence";
    124 studies; "far less research in secondary schools"; "it may be more effective to encourage parents to redirect
    a struggling pupil to their teachers"; "personalised messages linked to learning".
    https://educationendowmentfoundation.org.uk/education-evidence/teaching-learning-toolkit/parental-engagement —
    ⚠️ Internet Archive capture of 19 Sep 2026.
29. ⛔ Ariely, D. & Wertenbroch, K. (2002). Procrastination, deadlines, and performance: Self-control by
    precommitment. *Psychological Science*, 13(3), 219–224. doi:10.1111/1467-9280.00441 — **retracted**: notice
    doi:10.1177/09567976261488042 (Psychological Science, September 2026). Failed replication: Hyndman, K. & Bisin, A.
    (2026), *Psychological Science*, doi:10.1177/09567976261460772 ("our results do not replicate"). Do not cite for
    "external deadlines work".
30. ⚠️ Faria, A.-M., Sorensen, N., Heppen, J., Bowdon, J., Taylor, S., Eisner, R. & Foster, S. (2017). *Getting students
    on track for graduation: Impacts of the Early Warning Intervention and Monitoring System after one year* (REL
    2017-272). IES. 73 schools, 37,671 students aged 14–16. Read: the conference abstract
    https://spr.confex.com/spr/spr2017/webprogram/Paper25739.html and a summary
    https://thejournal.com/articles/2017/04/25/study-tech-enabled-early-warning-systems.aspx (chronic absence 10% vs
    14%; fewer course failures). The official report was not opened.

**Checked and not used:** Zimmerman (2002), doi:10.1207/s15430421tip4102_2 (overview; no claim needed) · Zimmerman &
Kitsantas (2005), doi:10.1016/j.cedpsych.2005.05.003 (path analysis, 179 girls; correlational) · Trautwein (2007),
doi:10.1016/j.learninstruc.2007.02.009 (abstract behind a paywall; only second-hand summaries found, so no claim taken)
· Urdan & Midgley (2001), doi:10.1023/A:1009061303214 (abstract behind a paywall; Schwinger et al. used instead).

**Corrections to our own files, found on the way**

- ⚠️ **EEF "Metacognition and self-regulation" shows +8 months, not +7.** The page (Internet Archive capture of
  2 Oct 2026; "Review last updated May 2025"; 355 studies) says "+8 months" and "an additional eight months'
  progress", and mentions no revision. Our 19 Aug file (:73–74, :81–82, :203–204) says EEF "revised it down to +7"
  and calls the Mastery Toolkit's +8 "stale". The "double-counted" point about two +8 rows still stands. Check before
  anyone changes the Toolkit panel. → for the lane that owns the Mastery Toolkit.
- ⚠️ Bergman & Chan reduced course failures by **27%**, not 28% as the nurture research says (:333).

**Where I looked (5 Oct 2026):** Crossref and OpenAlex (every DOI above), Semantic Scholar, publisher pages
(Springer, *Journal of Human Resources*, NBER, RePEc/IDEAS), EEF pages through the Internet Archive (EEF blocks
automated reads with HTTP 403), ERIC, gov.uk (the RR352 PDF itself), and web search. The "not found" items in §2 were
searched in the same places.

**Our own files read (with the lines that matter)**

- REMINDERS handoff: `~/.claude/handoffs/open/blog-to-dashboard-REMINDERS-ARE-NOT-THE-LEVER-help-seeking-avoidance-2026-08-19.md`
  :16–23 (reminders, navigation and dashboard prompt did not work) · :37–39 (a fourteenth reminder cannot work) ·
  :45–53 (default booking, named invitations) · :55–56 (never frame it as chasing).
- `research/2026-08-19-meta-skills-and-the-assessed-8-exam-3-gap.md` :252–268 (help-seeking: "the barrier was never
  awareness") · :301–305 (lower the cost of asking).
- `research/2026-07-18-help-seeking-and-corrective-feedback.md` :17 (feedback aimed at the self is least effective;
  over a third of feedback interventions lowered performance).
- `research/2026-07-29-habits-of-mastery-surface-vs-deep-and-gaming.md` :18–28 (students adapt to what they think is
  required: one reason to make the marked piece the named requirement).
- `research/2026-07-28-mastery-learning-time-vs-achievement.md` :31–36 (learning depends on time spent against time
  needed) · :43–44 (mastery costs time).
- `Sophicly Business Resources/SOPHICLY-PARENT-NURTURE-RESEARCH-2026-09-30.md` :302–307 (kinds of parental help) ·
  :332–352 (message trials and what they add up to) · :336 (defaults) · :338 (too many texts crowd out other habits)
  · :172–177 (the first marked piece).
- Memory `project_no_new_student_has_ever_been_given_a_grade.md` :11–18 (8 of 8 new students, no grade) · :25–29 (a
  marked piece in the first two weeks, sent to the parent).
- `~/.claude/handoffs/open/dashboard-FIXLIST.md` :333 (#270, the queued staff list) · :503 (#412, auto-booking
  research and parent booking texts) · :511 (#420, the `not_booked` rule, built and switched off) · :533–535 (#432/433,
  #437, #438).
- `sophicly-plugins/sophicly-student-data/includes/class-family-mail.php:134–148` (the automatic "we have booked a
  strategy session" email to parents).
- Memory `feedback_gamification_ruled_out_real_stats_are_the_motivator.md` :10 (no gamification).

**Paths in full:** the research files sit in
`sophicly-etchwp-package v2.6/Sophicly Etch Writing Mastery Plugin/sophicly_writing_mastery_lab_v7_12_30/research/`;
the nurture research sits in `sophicly-etchwp-package v2.6/Sophicly Etch Writing Mastery Plugin/Sophicly Business Resources/`.
