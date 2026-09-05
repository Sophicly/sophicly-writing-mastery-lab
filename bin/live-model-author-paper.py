#!/usr/bin/env python3
"""
live-model-author-paper.py — author a LIVE MODELLING past-paper topic from the board's OWN PDFs.

Emits the plugin's topic-template markdown (the grammar SWML_Topic_Parser already parses — one
vocabulary, no second writer) plus a sidecar `.checks.json` that the installer asserts before it
writes: the board's printed line markers must land on the board's own words, the line count must
match, and the tariff must sum to the paper's total.

    live-model-author-paper.py --board aqa --paper 1 --sitting 202011 \
        --ins "AQA-87001-INS-NOV20.PDF" --qp "AQA-87001-QP-NOV20.PDF" [--ms MS.PDF] \
        --out bin/live-modelling-papers/aqa/aqa_lang_paper_1/202011.md

Supported: AQA 8700 Paper 1 (one fiction source, Q1–Q5). Paper 2 lands next.
Anything the tool cannot read from the PDF is written as [NEEDS HUMAN: …] and listed in the
sidecar — it never guesses (root CLAUDE.md §19/§20).
"""
import argparse, hashlib, json, os, re, subprocess, sys, difflib

SITTING_WORDS = {'06': 'June', '11': 'November'}
AQA_P1_AOS = {1: 'AO1', 2: 'AO2', 3: 'AO2', 4: 'AO4', 5: 'AO5, AO6'}
AQA_P1_MARKS = {1: 4, 2: 8, 3: 8, 4: 20, 5: 40}

FURNITURE = re.compile(r'^\s*(IB/G/|\*\d+\*|Turn over|END OF QUESTIONS|Do not write|outside the|box\s*$|For Examiner|Question\s+Mark|TOTAL\s*$|\d{1,2}\s*$|Please write clearly|Centre number|Surname|Forename|Candidate signature|I declare)', re.I)
GUTTER = re.compile(r'\s{3,}(Do not write|outside the|b|bo|box|Turn over\s*►?|\d{1,2})\s*$', re.I)

def pdftext(path, first=None, last=None):
    cmd = ['pdftotext', '-layout']
    if first: cmd += ['-f', str(first)]
    if last: cmd += ['-l', str(last)]
    cmd += [path, '-']
    # form feeds mark page breaks and would otherwise turn a page number into a 'line'
    return subprocess.run(cmd, check=True, capture_output=True, text=True).stdout.replace('\x0c', '')

def sha1(path):
    h = hashlib.sha1()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 16), b''): h.update(chunk)
    return h.hexdigest()

def clean(line):
    line = GUTTER.sub('', line.rstrip())
    return line

# ─────────────────────────────────────────────── INSERT ───────────────────────────────────────
def parse_front(lines, letter):
    """Front-page block: 'Source X:  <genre>' then title/author line then position sentence."""
    meta = {'genre': '', 'title': '', 'author': '', 'position': '', 'year': ''}
    for i, ln in enumerate(lines):
        m = re.match(r'\s*Source ' + letter + r':\s+(.+?)\s*$', ln)
        if not m: continue
        meta['genre'] = m.group(1).strip()
        rest = [l.strip() for l in lines[i + 1:i + 8] if l.strip()]
        # line 2 = title (optionally "Title by Author"); line 3 = position sentence, which may
        # itself carry the author ("written in 2016 by journalist Arifa Akbar").
        if rest and not re.match(r'\s*Source [AB]:', rest[0]):
            t = rest[0]
            if ' by ' in t:
                t, a = t.rsplit(' by ', 1); meta['author'] = a.strip()
            meta['title'] = t.strip()
        if len(rest) > 1 and not re.match(r'\s*Source [AB]:', rest[1]) and not re.match(r'Please turn', rest[1], re.I):
            meta['position'] = rest[1]
        if not meta['author'] and meta['position']:
            am = re.search(r'\bby\s+(?:(?:journalist|explorer|writer|author|climber|poet|novelist|traveller|the\s+\w+)\s+)?([A-Z][\w\'’.\-]+(?:\s+(?:[A-Z][\w\'’.\-]+|de|van|von|of))+)', meta['position'])
            if am: meta['author'] = am.group(1).strip()
        break
    ym = re.search(r'\b(1[5-9]\d\d|20\d\d)\b', meta['position'] or '')
    if ym: meta['year'] = ym.group(1)
    return meta

def parse_insert(path, letter='A'):
    raw = pdftext(path)
    lines = raw.split('\n')
    meta = parse_front(lines, letter)
    # body: after a line that is exactly "Source X", until the next Source heading / END OF SOURCE(S)
    start = None
    for i, ln in enumerate(lines):
        if re.match(r'^\s*Source ' + letter + r'\s*$', ln): start = i + 1
    if start is None: raise SystemExit(f'insert: no "Source {letter}" body heading found')
    intro, body, checks = [], [], {}
    # Pass 1 — collect the block and learn the BODY TEXT COLUMN from the first printed marker,
    # because some inserts print no marker on line 1 (markers at 5, 10, …) and the opening
    # lines must still be counted as body, not context. Context lines hug the left margin.
    block = []
    for ln in lines[start:]:
        if re.search(r'END OF SOURCE', ln) or re.match(r'^\s*Source [AB]\s*$', ln): break
        if re.match(r'^\s*(IB/G/|\*\d+\*)', ln) or re.match(r'^\s*\d{1,2}\s*$', ln): continue
        # right-margin furniture ("Turn over ►", often truncated to "Tur" by the layout)
        if re.match(r'^\s{30,}(Tur\w*(\s+over)?\s*►?|►)\s*$', ln) or re.match(r'^\s*Turn over', ln): continue
        block.append(ln)
    body_col = None
    for ln in block:
        m = re.match(r'^(\s{0,8}\d{1,3}\s+)(\S.*)$', ln)
        if m: body_col = len(m.group(1)); break
    if body_col is None: raise SystemExit(f'insert: Source {letter} has no printed line markers at all')
    n = 0; in_body = False; blank_pending = False; pending_marker = None
    pre = []   # body-column lines seen BEFORE the first printed marker (numbered lines 1..k-1, plus any unnumbered header)
    def flush_pre(k):
        # the last k-1 buffered lines are lines 1..k-1; anything earlier is an unnumbered header (kept, unnumbered)
        nonlocal n
        head = pre[:max(0, len(pre) - (k - 1))]; numbered = pre[len(head):]
        if len(numbered) != k - 1:
            raise SystemExit(f'insert Source {letter}: first printed marker is {k} but only {len(numbered)} body lines precede it — refusing')
        for h in head: body.append((None, h))
        if head and numbered: body.append((None, ''))
        for txt in numbered:
            n += 1; body.append((n, txt))
    for ln in block:
        if not ln.strip():
            if in_body: blank_pending = True
            continue
        # a printed marker ALONE on its line: the numbered text is the next line
        ma = re.match(r'^\s{0,8}(\d{1,3})\s*$', ln)
        if ma and in_body:
            if pre is not None: flush_pre(int(ma.group(1))); pre = None
            pending_marker = int(ma.group(1)); continue
        if not in_body:
            indent = len(ln) - len(ln.lstrip())
            if indent >= body_col - 2 and not re.match(r'^\s{0,8}\d{1,3}\s+\S', ln):
                in_body = True   # an unnumbered opening line sitting in the body column
        m = re.match(r'^\s{0,8}(\d{1,3})\s+(\S.*)$', ln)
        if m:
            k = int(m.group(1)); txt = m.group(2).rstrip()
            if pre is not None: flush_pre(k); pre = None
            in_body = True; n += 1
            if k != n:
                raise SystemExit(f'insert Source {letter}: printed marker {k} landed on reconstructed line {n} — refusing (text: {txt[:50]!r})')
            checks[str(k)] = txt[:32]
            if blank_pending: body.append((None, ''))
            body.append((n, txt)); blank_pending = False
            continue
        if in_body:
            m2 = re.match(r'^\s+(\S.*)$', ln)
            if not m2:
                raise SystemExit(f'insert Source {letter}: unrecognised body line {ln!r}')
            if pre is not None:
                pre.append(m2.group(1).rstrip()); continue
            n += 1
            if pending_marker is not None:
                if pending_marker != n:
                    raise SystemExit(f'insert Source {letter}: printed marker {pending_marker} (alone on its line) landed on reconstructed line {n} — refusing')
                checks[str(n)] = m2.group(1).rstrip()[:32]; pending_marker = None
            if blank_pending: body.append((None, ''))
            body.append((n, m2.group(1).rstrip())); blank_pending = False
        else:
            intro.append(ln.strip())
    if not body: raise SystemExit(f'insert: no numbered body lines for Source {letter}')
    meta['intro'] = ' '.join(intro)
    return meta, body, checks

# ─────────────────────────────────────────────── QUESTION PAPER (P2) ──────────────────────────
AQA_P2_AOS = {1: 'AO1', 2: 'AO1', 3: 'AO2', 4: 'AO3', 5: 'AO5, AO6'}
AQA_P2_MARKS = {1: 4, 2: 8, 3: 12, 4: 16, 5: 40}

def parse_ms_key(path):
    """AQA P2 mark scheme lists Q1's statements again with [T]/[F] — that is the key."""
    if not path: return {}
    key = {}
    for ln in pdftext(path).split('\n'):
        m = re.match(r'^\s*([A-H])\s+(.+?)\s*\[([TF])\]\s*$', ln)
        if m and m.group(1) not in key: key[m.group(1)] = (m.group(3) == 'T')
    return key

def parse_qp_p2(path, ms_path=None):
    raw = pdftext(path)
    lines = [clean(l) for l in raw.split('\n')]
    starts = []
    for i, ln in enumerate(lines):
        m = re.match(r'^\s*0\s+([1-5])(?:\s{2,}(\S.*))?\s*$', ln)
        if m: starts.append((i, int(m.group(1)), (m.group(2) or '').strip()))
    if [s[1] for s in starts] != [1, 2, 3, 4, 5]:
        raise SystemExit(f'qp: expected questions 1..5 in order, found {[s[1] for s in starts]}')
    qs = {}; needs_human = []; statements = []
    for idx, (i, qn, first) in enumerate(starts):
        end = starts[idx + 1][0] if idx + 1 < len(starts) else len(lines)
        block = ([first] if first else []) + lines[i + 1:end]
        marks = None; kept = []; after = []
        for ln in block:
            if marks is not None: after.append(ln); continue
            mm = re.search(r'\[(\d+)\s*marks?\]', ln, re.I)
            if mm:
                marks = int(mm.group(1)); pre = ln[:mm.start()].strip()
                if pre: kept.append(pre)
                continue
            if FURNITURE.match(ln): continue
            kept.append(ln)
        paras = []; cur = []
        for ln in kept:
            s = ln.strip()
            if not s:
                if cur: paras.append(' '.join(cur)); cur = []
                continue
            if re.match(r'^[•·]\s*', s):
                if cur: paras.append(' '.join(cur)); cur = []
                paras.append('- ' + re.sub(r'^[•·]\s*', '', s)); continue
            if re.match(r'^\(\d+ marks for', s):
                if cur: paras.append(' '.join(cur)); cur = []
                paras.append(s); continue
            # bullet continuation lines are indented under the bullet
            if paras and paras[-1].startswith('- ') and not cur and ln.startswith(' ' * 10):
                paras[-1] += ' ' + s; continue
            cur.append(s)
        if cur: paras.append(' '.join(cur))
        if qn == 1:
            # statements A–H follow the marks line; a wrapped statement continues on an indented line
            for ln in after:
                if FURNITURE.match(ln): continue
                m = re.match(r'^\s*([A-H])\s+(\S.*)$', ln)
                if m: statements.append([m.group(1), m.group(2).strip()])
                elif statements and ln.strip() and not re.match(r'^\s*0\s+\d', ln):
                    statements[-1][1] += ' ' + ln.strip()
            if len(statements) != 8:
                needs_human.append(f'Q1 read {len(statements)} statements, expected 8')
        text = '\n\n'.join(paras).strip()
        if marks is None:
            needs_human.append(f'Q{qn} marks not found'); marks = AQA_P2_MARKS[qn]
        qs[qn] = {'text': text, 'marks': marks}
    key = parse_ms_key(ms_path)
    if statements and len(key) < 8:
        needs_human.append('Q1 true/false key not read from the mark scheme — statements written as [?]')
    qs[1]['statements'] = [(letter, txt, key.get(letter)) for letter, txt in statements]
    return qs, needs_human

# ─────────────────────────────────────────────── QUESTION PAPER (P1) ──────────────────────────
def parse_qp_p1(path, picture=None):
    raw = pdftext(path)
    lines = [clean(l) for l in raw.split('\n')]
    # find question starts
    starts = []
    for i, ln in enumerate(lines):
        m = re.match(r'^\s*0\s+([1-5])(?:\s{2,}(\S.*))?\s*$', ln)
        if m: starts.append((i, int(m.group(1)), (m.group(2) or '').strip()))
    if [s[1] for s in starts] != [1, 2, 3, 4, 5]:
        raise SystemExit(f'qp: expected questions 1..5 in order, found {[s[1] for s in starts]}')
    qs = {}; needs_human = []
    for idx, (i, qn, first) in enumerate(starts):
        end = starts[idx + 1][0] if idx + 1 < len(starts) else len(lines)
        block = [first] + lines[i + 1:end]
        marks = None; kept = []
        for ln in block:
            if marks is not None: break
            mm = re.search(r'\[(\d+)\s*marks?\]', ln, re.I)
            if mm:
                marks = int(mm.group(1)); pre = ln[:mm.start()].strip()
                if pre: kept.append(pre)
                continue
            if FURNITURE.match(ln): continue
            kept.append(ln)
        # paragraphs
        paras = []; cur = []
        for ln in kept:
            s = ln.strip()
            if not s:
                if cur: paras.append(' '.join(cur)); cur = []
                continue
            if re.match(r'^[•·]\s*', s):
                if cur: paras.append(' '.join(cur)); cur = []
                paras.append('- ' + re.sub(r'^[•·]\s*', '', s))
                continue
            if re.match(r'^\(\d+ marks for', s):
                if cur: paras.append(' '.join(cur)); cur = []
                paras.append(s); continue
            if qn == 1 and re.match(r'^\d$', s): continue   # answer slots 1..4
            cur.append(s)
        if cur: paras.append(' '.join(cur))
        # Q2: the quoted extract sits between the first line and "How does the writer"
        if qn == 2:
            out = []; quote = []; seen_first = False; quoting = False
            for p in paras:
                if not seen_first:
                    out.append(p); seen_first = True; quoting = True; continue
                if quoting and not re.match(r'^How does the writer', p, re.I):
                    quote.append(p); continue
                if quoting:
                    out.append('> ' + ' '.join(quote)); quoting = False
                out.append(p)
            paras = out
        # Q5: Either/Or + picture placeholder
        if qn == 5:
            out = []
            for p in paras:
                if re.match(r'^Either:?$', p, re.I): out.append('**Either:**'); continue
                if re.match(r'^Or:?$', p, re.I): out.append('**Or:**'); continue
                out.append(p)
                if re.search(r'suggested by this picture:?$', p, re.I):
                    if picture:
                        out.append(f'[IMAGE — {picture.strip()}]')
                    else:
                        out.append('[NEEDS HUMAN: describe the picture in one line — the PDF image is not text]')
                        needs_human.append('Q5 picture description')
            paras = out
        text = '\n\n'.join(paras).strip()
        if marks is None:
            needs_human.append(f'Q{qn} marks not found'); marks = AQA_P1_MARKS[qn]
        qs[qn] = {'text': text, 'marks': marks}
    return qs, needs_human

# ─────────────────────────────────────────────── QUESTION BANK CROSS-CHECK ────────────────────
def bank_check(bank_path, sitting_label, qs, paper=1):
    if not os.path.exists(bank_path): return {'skipped': 'no bank'}
    txt = open(bank_path, encoding='utf-8').read()
    sec = re.search(r'## AQA English Language Paper ' + str(paper) + r'.*?(?=\n## AQA English Language Paper|\n## AQA English Literature)', txt, re.S)
    if not sec: return {'skipped': 'no P1 section'}
    blk = re.search(r'### ' + re.escape(sitting_label) + r'\n(.*?)(?=\n### )', sec.group(0), re.S)
    if not blk: return {'skipped': f'no bank entry for {sitting_label}'}
    res = {}
    for qn in (2, 3, 4):
        m = re.search(r'\*\*Q' + str(qn) + r' \(\d+ marks\):\*\*\s*(.+)', blk.group(1))
        if not m: res[f'Q{qn}'] = 'bank: missing'; continue
        ours = re.sub(r'\s+', ' ', re.sub(r'^> .*$', '', qs[qn]['text'], flags=re.M)).strip()[:160]
        theirs = m.group(1).strip()[:160]
        res[f'Q{qn}'] = round(difflib.SequenceMatcher(None, ours.lower(), theirs.lower()).ratio(), 2)
    return res

# ─────────────────────────────────────────────── EMIT ─────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--board', default='aqa'); ap.add_argument('--paper', type=int, required=True)
    ap.add_argument('--sitting', required=True, help='YYYYMM, e.g. 202011')
    ap.add_argument('--ins', required=True); ap.add_argument('--qp', required=True); ap.add_argument('--ms')
    ap.add_argument('--out', required=True); ap.add_argument('--bank', default='question-bank-2017-2025.md')
    ap.add_argument('--q5-picture', default=None, help='one-line description of the Q5 stimulus picture (Paper 1), written as [IMAGE — …] like the Rosabel install')
    a = ap.parse_args()
    if a.board != 'aqa' or a.paper not in (1, 2): raise SystemExit('only AQA Paper 1 and 2 are implemented so far')
    yyyy, mm = a.sitting[:4], a.sitting[4:6]
    sitting_label = f'{SITTING_WORDS[mm]} {yyyy}'
    letters = ['A'] if a.paper == 1 else ['A', 'B']
    sources = {L: parse_insert(a.ins, L) for L in letters}
    if a.paper == 1:
        qs, needs_human = parse_qp_p1(a.qp, a.q5_picture); AOS, MARKS = AQA_P1_AOS, AQA_P1_MARKS
        paper_name = 'Explorations in Creative Reading and Writing'; paper_desc = 'One fiction source'; paper_aos = 'AO1, AO2, AO4, AO5, AO6'
    else:
        qs, needs_human = parse_qp_p2(a.qp, a.ms); AOS, MARKS = AQA_P2_AOS, AQA_P2_MARKS
        paper_name = "Writers' Viewpoints and Perspectives"; paper_desc = 'Two non-fiction sources'; paper_aos = 'AO1, AO2, AO3, AO5, AO6'
    total = sum(q['marks'] for q in qs.values())
    if total != 80: raise SystemExit(f'qp: tariff sums to {total}, not 80 — refusing')
    for qn, want in MARKS.items():
        if qs[qn]['marks'] != want: raise SystemExit(f'qp: Q{qn} carries {qs[qn]["marks"]} marks, expected {want}')
    notes = []
    for L in letters:
        m = sources[L][0]
        if not m['title']: needs_human.append(f'Source {L} title not read from the insert front page')
        if not m['author']: notes.append(f"Source {L} is unattributed on the insert front page ('{m['position']}') — author written as Unknown")
    titles = ' / '.join(f"{sources[L][0]['title']} ({sources[L][0]['author'] or ('anon., ' + sources[L][0]['year'] if sources[L][0]['year'] else 'anon.')})" for L in letters)
    label = f"AQA Language Paper {a.paper} — {sitting_label} · {titles}"
    md = []
    md.append(f"# Topic {a.sitting}: {label}")
    md.append("**Type:** language_paper")
    md.append("**Format:** multi_question")
    md.append(f"**Teaching Point:** AQA Language Paper {a.paper} — {paper_name}, {sitting_label} sitting. {paper_desc}, five questions, 80 marks total. Section A tests reading (Q1–Q4), Section B tests writing (Q5). You have 1 hour 45 minutes.")
    md.append("**Marks:** 80")
    md.append(f"**AOs:** {paper_aos}")
    md.append("")
    for L in letters:
        meta, body, checks = sources[L]
        author_year = f"{meta['author']} ({meta['year']})" if meta['year'] and meta['author'] else (meta['author'] or (f"Unknown ({meta['year']})" if meta['year'] else 'Unknown'))
        context = '. '.join(x.rstrip('.') for x in [meta['genre'], meta['position'], meta['intro']] if x) + '.'
        md.append(f"## Source {L}")
        md.append(f"**Title:** {meta['title']}")
        md.append(f"**Author:** {author_year}")
        md.append(f"**Context:** {context}")
        md.append("")
        for n, txt in body: md.append((txt if txt else '') if n is None else f"{n:<3}{txt}")
        md.append("")
    for qn in range(1, 6):
        md.append(f"## Q{qn}")
        md.append(f"**Marks:** {qs[qn]['marks']}")
        md.append(f"**AOs:** {AOS[qn]}")
        md.append(qs[qn]['text'])
        if qn == 1 and qs[qn].get('statements'):
            md.append("")
            md.append("### Statements")
            for k, (letter, txt, truth) in enumerate(qs[qn]['statements'], 1):
                tf = '?' if truth is None else ('T' if truth else 'F')
                md.append(f"{k}. [{tf}] {txt}")
        md.append("")
    md.append("---")
    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    open(a.out, 'w', encoding='utf-8').write('\n'.join(md) + '\n')
    side = {
        'topic_number': int(a.sitting), 'board': a.board, 'text': f'aqa_lang_paper_{a.paper}',
        'store': f'swml_topics_aqa_aqa_lang_paper_{a.paper}', 'label': label,
        'sources': {L: {'line_count': max(n for n, _ in sources[L][1] if n), 'line_checks': sources[L][2]} for L in letters},
        'questions': {f'Q{qn}': qs[qn]['marks'] for qn in range(1, 6)}, 'total_marks': total,
        'provenance': {'ins': os.path.basename(a.ins), 'ins_sha1': sha1(a.ins), 'qp': os.path.basename(a.qp), 'qp_sha1': sha1(a.qp), 'ms': os.path.basename(a.ms) if a.ms else None},
        'bank_check': bank_check(a.bank, sitting_label, qs, a.paper),
        'needs_human': needs_human,
        'notes': notes,
    }
    open(re.sub(r'\.md$', '', a.out) + '.checks.json', 'w', encoding='utf-8').write(json.dumps(side, indent=2, ensure_ascii=False) + '\n')
    print(f"✓ {a.out}")
    print(f"  {label}")
    print("  " + '  '.join(f"Source {L}: {side['sources'][L]['line_count']} lines, {len(side['sources'][L]['line_checks'])} markers" for L in letters) + f"  tariff={side['questions']} bank={side['bank_check']}")
    if needs_human: print("  NEEDS HUMAN: " + ' | '.join(needs_human))
    if notes: print("  note: " + ' | '.join(notes))

if __name__ == '__main__': main()
