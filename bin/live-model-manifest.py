#!/usr/bin/env python3
"""
live-model-manifest.py — turn the authored live-modelling papers into the LearnDash lesson list.

    python3 bin/live-model-manifest.py > live-modelling-manifest.json

One row per installed topic: section · unit · lesson title · the exact shortcode · the bridge
entry. The LD lane creates the course FROM THIS FILE (never by hand). `{{AUTHOR_UID}}` is the
designated author's user id on the target environment (prod 1, staging 1355) — substituted by
the creating script, never committed as a number.

Tree (Neil's ruling 2026-09-05, "skill-first"): Section = paper family · Unit = board's paper ·
Lesson = sitting, newest first.
"""
import glob, json, os, re, sys

ROOT = os.path.join(os.path.dirname(__file__), 'live-modelling-papers')
SITTING = {'06': 'June', '11': 'November'}
UNITS = {
    ('aqa', 'aqa_lang_paper_1'): ('Fiction reading — Language Paper 1 family', 'AQA Language Paper 1'),
    ('aqa', 'aqa_lang_paper_2'): ('Non-fiction reading + transactional writing — Language Paper 2 family', 'AQA Language Paper 2'),
    ('aqa', 'unseen_poetry'):    ('Unseen Poetry', 'AQA Literature Paper 2 Section C'),
}
SUBJECT = {'aqa_lang_paper_1': 'language', 'aqa_lang_paper_2': 'language', 'unseen_poetry': 'unseen_poetry'}

def surname(author):
    a = re.sub(r'\s*\(.*?\)\s*', '', author or '').strip()
    return a.split()[-1] if a and a.lower() != 'unknown' else 'anon.'

rows = []
for side_path in sorted(glob.glob(os.path.join(ROOT, '**', '*.checks.json'), recursive=True)):
    side = json.load(open(side_path, encoding='utf-8'))
    if side.get('needs_human'):
        print(f"skip {os.path.basename(side_path)}: NEEDS HUMAN — {' | '.join(side['needs_human'])}", file=sys.stderr); continue
    md = re.sub(r'\.checks\.json$', '.md', side_path)
    txt = open(md, encoding='utf-8').read()
    board, text, n = side['board'], side['text'], int(side['topic_number'])
    yyyy, mm = str(n)[:4], str(n)[4:6]
    sitting = f"{SITTING.get(mm, mm)} {yyyy}"
    titles = []
    for m in re.finditer(r'^## Source [AB]\n\*\*Title:\*\* (.+)\n\*\*Author:\*\* (.+)$', txt, re.M):
        titles.append(f"{m.group(1).strip()} ({surname(m.group(2))})")
    for m in re.finditer(r'^### Poem\n\*\*Title:\*\* (.+)\n\*\*Poet:\*\* (.+)$', txt, re.M):
        titles.append(f"{m.group(1).strip()} ({surname(m.group(2))})")
    variant = ' (reserve)' if len(str(n)) == 7 else ''
    section, unit = UNITS[(board, text)]
    rows.append({
        'section': section, 'unit': unit,
        'lesson_title': f"{sitting}{variant} · " + ' / '.join(titles),
        'sitting': sitting, 'board': board, 'text': text, 'topic_number': n, 'subject': SUBJECT[text],
        'shortcode': f'[writing_mastery_lab task="diagnostic" phase="initial" topic="{n}" board="{board}" text="{text}" subject="{SUBJECT[text]}" author="{{{{AUTHOR_UID}}}}"]',
        'bridge': {'wml_task': 'diagnostic', 'wml_phase': 'initial', 'wml_topic': n, 'wml_author': '{{AUTHOR_UID}}'},
        'source_pdfs': side.get('provenance', {}),
        'notes': side.get('notes', []),
    })
# Rosabel (June 2017) is already installed as topic 11 — it rides along under its existing number
rows.append({
    'section': UNITS[('aqa', 'aqa_lang_paper_1')][0], 'unit': UNITS[('aqa', 'aqa_lang_paper_1')][1],
    'lesson_title': 'June 2017 · The Tiredness of Rosabel (Mansfield)', 'sitting': 'June 2017',
    'board': 'aqa', 'text': 'aqa_lang_paper_1', 'topic_number': 11, 'subject': 'language',
    'shortcode': '[writing_mastery_lab task="diagnostic" phase="initial" topic="11" board="aqa" text="aqa_lang_paper_1" subject="language" author="{{AUTHOR_UID}}"]',
    'bridge': {'wml_task': 'diagnostic', 'wml_phase': 'initial', 'wml_topic': 11, 'wml_author': '{{AUTHOR_UID}}'},
    'source_pdfs': {'ins': 'AQA Lang P1 Insert Jun2017 Rosabel.pdf', 'qp': 'AQA Lang P1 QP Jun2017 Rosabel.pdf'}, 'notes': ['installed 2026-08-26 by bin/live-model-install-paper.php as topic 11 (not YYYYMM)'],
})
order = {'June': 6, 'November': 11}
rows.sort(key=lambda r: (r['section'], r['unit'], -(int(r['sitting'].split()[1]) * 100 + order.get(r['sitting'].split()[0], 0))))
out = {
    'course': 'Live Modelling',
    'ruling': 'skill-first (Neil, 2026-09-05): Section = paper family · Unit = board paper · Lesson = sitting, newest first',
    'author_uid_placeholder': '{{AUTHOR_UID}}', 'author_uid_by_env': {'prod': 1, 'staging': 1355},
    'enrol': 'every paid tier (Bronze upward); Free: no',
    'lessons': rows,
}
json.dump(out, sys.stdout, indent=2, ensure_ascii=False); print()
