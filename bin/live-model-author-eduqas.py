#!/usr/bin/env python3
"""
live-model-author-eduqas.py — author a LIVE MODELLING past-paper topic from EDUQAS's OWN PDFs.

The Eduqas twin of live-model-author-paper.py (AQA). Same contract, same output grammar: the
plugin's topic-template markdown that SWML_Topic_Parser already parses, plus a `.checks.json`
sidecar the local gate and the installer assert before anything is written.

    live-model-author-eduqas.py --component 1 --sitting 202306 \
        --qp "June 2023 QP - Component 1 Eduqas English Language GCSE.pdf" \
        [--ins "JUNE 2019 Insert.pdf"] [--ms "June 2023 MS ….pdf"] \
        --out bin/live-modelling-papers/eduqas/eduqas_lang_paper_1/202306.md

Supported: Eduqas GCSE English Language C700U10 Component 1 and C700U20 Component 2.

WHAT THE BOARD ACTUALLY PRINTS — measured from the PDFs, not assumed (root CLAUDE.md §19/§20):

  Component 1 (C700U10-1, 1h45, 80 marks) — one 20th/21st-century prose-fiction source printed on
  a separate Resource Material (code -1A), line-numbered by the board with a printed marker on
  line 1 and every fifth line thereafter.
      0 1 [5]  0 2 [5]  0 3 [10]  0 4 [10]  0 5 [10]   → Section A, 40
      1 1 [40] four titles a)–d)                       → Section B, 40
  We emit those as Q1–Q5 and Q6 (the shape of protocols/shared/templates/topics/eduqas-language-c1.md
  and of protocols/shared/language-paper-specs.json → eduqas.language_c1).

  Component 2 (C700U20-1, 2h, 80 marks) — TWO non-fiction sources. Source A is the 21st-century
  newspaper article on the separate Resource Material (code -1A); Source B is the 19th-century
  extract printed on the facing page of the question paper itself. NEITHER carries printed line
  markers — Eduqas never cites a line number in a Component 2 question.
      1 1 a)b)c) [1][1][1]=3   1 2 [10]   1 3 a)b)c) [1][1][1]=3
      1 4 [10]   1 5 [4]   1 6 [10]                    → Section A, 40
      2 1 [20]   2 2 [20]                              → Section B, 40
  We emit those as Q1–Q6 and Q7–Q8, one emitted question per printed cell, so the ids track the
  board's own cells 1:1 in count, order and tariff.

AO MAP — read off the board's own mark schemes, never from general GCSE knowledge:
  C1  Summer 2023 MS: 0 1 (AO1 1a and b) · 0 2 (AO2 1a, c and d) · 0 3 (AO2 1a, b, c and d)
                      0 4 (AO2 1a, c and d) · 0 5 (AO4) · Section B AO5 (60%) + AO6 (40%)
  C2  Autumn 2021 MS and Autumn 2022 MS agree: 1 1 (AO1) · 1 2 (AO2) · 1 3 (AO1) · 1 4 (AO4)
                      1 5 (AO1 2a and b) · 1 6 (AO3) · Section B AO5 (60%) + AO6 (40%)
  Pass --ms and the annotations in that sitting's own mark scheme are ASSERTED against this map;
  a disagreement is written to needs_human rather than silently absorbed.

Anything the tool cannot read from the PDF is written as [NEEDS HUMAN: …] and listed in the
sidecar. It never guesses a question, a tariff, a title or an author.
"""
import argparse, hashlib, json, os, re, subprocess, sys

MONTHS = {'JANUARY': 1, 'FEBRUARY': 2, 'MARCH': 3, 'APRIL': 4, 'MAY': 5, 'JUNE': 6,
          'JULY': 7, 'AUGUST': 8, 'SEPTEMBER': 9, 'OCTOBER': 10, 'NOVEMBER': 11, 'DECEMBER': 12}
MONTH_WORD = {v: k.capitalize() for k, v in MONTHS.items()}

C1_AOS   = {1: 'AO1', 2: 'AO2', 3: 'AO2', 4: 'AO2', 5: 'AO4', 6: 'AO5, AO6'}
C1_MARKS = {1: 5, 2: 5, 3: 10, 4: 10, 5: 10, 6: 40}
C2_AOS   = {1: 'AO1', 2: 'AO2', 3: 'AO1', 4: 'AO4', 5: 'AO1', 6: 'AO3', 7: 'AO5, AO6', 8: 'AO5, AO6'}
C2_MARKS = {1: 3, 2: 10, 3: 3, 4: 10, 5: 4, 6: 10, 7: 20, 8: 20}
# the board's own printed cell for each emitted question id
C1_PRINTED = {1: '0 1', 2: '0 2', 3: '0 3', 4: '0 4', 5: '0 5', 6: '1 1'}
C2_PRINTED = {1: '1 1', 2: '1 2', 3: '1 3', 4: '1 4', 5: '1 5', 6: '1 6', 7: '2 1', 8: '2 2'}

# page/paper furniture — never part of a source or a question
FURNITURE = re.compile(
    r'^\s*(PMT\s*$|©\s*WJEC|\(C700U[12]0-1A?\)|Turn over\.?\s*$|END OF PAPER|BLANK PAGE'
    r'|The space below can be used to plan your work\.|SECTION [AB]:\s*\d+ marks'
    r'|Answer all the following questions\.|Read carefully the passage below\.'
    r'|Read carefully the passage in the separate Resource Material'
    r'|Then answer all the questions below\.)', re.I)


def pdf_pages(path):
    """One string per page, form feeds stripped (a form feed would turn a page number into a line)."""
    raw = subprocess.run(['pdftotext', '-layout', path, '-'], check=True,
                         capture_output=True, text=True).stdout
    return [p.replace('\x0c', '') for p in raw.split('\x0c')]


def sha1(path):
    h = hashlib.sha1()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 16), b''):
            h.update(chunk)
    return h.hexdigest()


def strip_furniture(lines):
    out = []
    for ln in lines:
        ln = ln.replace('\t', '        ').rstrip()
        if not ln.strip():
            out.append('')
            continue
        if FURNITURE.match(ln.strip()):
            continue
        if re.match(r'^\s*\d{1,2}\s*$', ln):        # lone page number
            continue
        if re.match(r'^\s*PMT\s*$', ln):
            continue
        out.append(ln)
    return out


# ────────────────────────────────────── front page ───────────────────────────────────────────
def read_front(pages, component):
    """The exam date and the paper code, from the board's own front page."""
    code = 'C700U10-1' if component == 1 else 'C700U20-1'
    for pg in pages[:2]:
        m = re.search(r'(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)\s*,\s*'
                      r'(\d{1,2})\s+([A-Z]+)\s+(\d{4})', pg)
        if m and code in pg:
            return {'day': int(m.group(2)), 'month': MONTHS[m.group(3)], 'year': int(m.group(4)),
                    'printed_date': f"{m.group(1).capitalize()}, {m.group(2)} {m.group(3).capitalize()} {m.group(4)}"}
    # 2019-style front page prints the date after the component title
    for pg in pages[:2]:
        m = re.search(r'(\d{1,2})\s+([A-Z]{3,9})\s+(\d{4})\s*[–-]\s*(MORNING|AFTERNOON)', pg)
        if m:
            return {'day': int(m.group(1)), 'month': MONTHS[m.group(2)], 'year': int(m.group(3)),
                    'printed_date': f"{m.group(1)} {m.group(2).capitalize()} {m.group(3)}"}
    return None


# ─────────────────────────────────── COMPONENT 1 — the source ─────────────────────────────────
def c1_source_pages(qp_pages, ins_pages):
    """The Resource Material body pages, wherever they live.

    Eduqas prints the passage on a separate Resource Material booklet (code -1A). Some bundles
    staple it onto the end of the question-paper PDF; a standalone insert file carries only the
    body pages. Either way the body starts on the page that says 'Read carefully the passage
    below.' (the QP itself says '…in the separate Resource Material', which is NOT a match)."""
    for pages in ([ins_pages] if ins_pages else []) + [qp_pages]:
        if not pages:
            continue
        start = None
        for i, pg in enumerate(pages):
            if re.search(r'Read carefully the passage below\.', pg):
                start = i
                break
        if start is None:
            continue
        body = []
        for pg in pages[start:]:
            if re.search(r'BLANK PAGE', pg):
                break
            if re.search(r'INSTRUCTIONS TO CANDIDATES', pg):
                break
            body.append(pg)
        if body:
            return body
    raise SystemExit("component 1: no Resource Material page ('Read carefully the passage below.') "
                     "in the question paper or the insert — refusing")


def parse_c1_source(pages):
    """Reconstruct the board's numbered passage and ASSERT every printed marker lands on the
    board's own words. Marker on line 1 and every fifth line; markers sit at the left margin,
    body text one column further in; continuation lines hug the body column."""
    lines = strip_furniture('\n'.join(pages).split('\n'))
    # drop the leading heading block; keep what follows for context/title detection
    block = []
    seen_heading = False
    for ln in lines:
        if not seen_heading:
            # strip_furniture already removed the 'Read carefully…' heading, so the block starts
            # at the first content line; nothing to skip
            seen_heading = True
        block.append(ln)
    while block and not block[0].strip():
        block.pop(0)
    while block and not block[-1].strip():
        block.pop()
    if not block:
        raise SystemExit('component 1 source: nothing left after removing page furniture')

    # the author is the last non-blank line if it is set well to the right and reads as a name
    author = ''
    for j in range(len(block) - 1, -1, -1):
        if not block[j].strip():
            continue
        cand = block[j]
        indent = len(cand) - len(cand.lstrip())
        txt = cand.strip()
        if indent >= 40 and 1 <= len(txt.split()) <= 4 and not txt.endswith(('.', '!', '?', ',', '’', '”')):
            author = txt
            block = block[:j]
        break
    while block and not block[-1].strip():
        block.pop()

    body_col = None
    for ln in block:
        m = re.match(r'^(\s{0,8}\d{1,3}\s+)(\S.*)$', ln)
        if m:
            body_col = len(m.group(1))
            break
    if body_col is None:
        raise SystemExit('component 1 source: no printed line markers at all — refusing')

    context, title, body, checks = [], '', [], {}
    n = 0
    in_body = False
    blank_pending = False
    for ln in block:
        if not ln.strip():
            if in_body:
                blank_pending = True
            continue
        m = re.match(r'^\s{0,8}(\d{1,3})\s+(\S.*)$', ln)
        if m:
            k, txt = int(m.group(1)), m.group(2).rstrip()
            in_body = True
            n += 1
            if k != n:
                raise SystemExit(f'component 1 source: printed marker {k} landed on reconstructed '
                                 f'line {n} — refusing (text: {txt[:50]!r})')
            checks[str(k)] = txt[:32]
            if blank_pending and body:
                body.append((None, ''))
            body.append((n, txt))
            blank_pending = False
            continue
        if in_body:
            m2 = re.match(r'^\s+(\S.*)$', ln)
            if not m2:
                raise SystemExit(f'component 1 source: unrecognised body line {ln!r}')
            n += 1
            if blank_pending and body:
                body.append((None, ''))
            body.append((n, m2.group(1).rstrip()))
            blank_pending = False
            continue
        # before the first marker: a centred short line is the passage title, anything else context
        indent = len(ln) - len(ln.lstrip())
        txt = ln.strip()
        if indent >= 30 and len(txt.split()) <= 10 and not txt.endswith('.'):
            title = txt
        else:
            context.append(txt)
    if not body:
        raise SystemExit('component 1 source: no numbered body lines')
    return {'title': title, 'author': author, 'context': ' '.join(context),
            'body': body, 'checks': checks, 'count': n}


# ─────────────────────────────────── COMPONENT 2 — the sources ────────────────────────────────
def number_plain(lines):
    """Eduqas prints NO line markers on Component 2. Number the lines as laid out so the document
    can cite them, keep blank lines as paragraph breaks, and stamp our own every-fifth check so
    the gate still proves the markdown round-trips to the board's words."""
    body, checks, n, blank = [], {}, 0, False
    for ln in lines:
        if not ln.strip():
            if body:
                blank = True
            continue
        n += 1
        if blank:
            body.append((None, ''))
            blank = False
        txt = ln.strip()
        body.append((n, txt))
        if n == 1 or n % 5 == 0:
            checks[str(n)] = txt[:32]
    return body, checks, n


def parse_c2_source_a(qp_pages):
    """Source A — the 21st-century newspaper article on the separate Resource Material (-1A)."""
    start = None
    for i, pg in enumerate(qp_pages):
        if re.search(r'RESOURCE MATERIAL FOR USE WITH SECTION A|Resource Material for use with Section A',
                     pg) and re.search(r'C700U20-1A', pg):
            start = i + 1
    if start is None:
        raise SystemExit('component 2: no Resource Material front page (C700U20-1A) — refusing')
    pages = []
    for pg in qp_pages[start:]:
        if re.search(r'BLANK PAGE', pg):
            break
        pages.append(pg)
    if not pages:
        raise SystemExit('component 2: the Resource Material front page has no body pages after it')
    lines = strip_furniture('\n'.join(pages).split('\n'))
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    # the byline is the last non-blank line if it is set right and reads as a name
    byline = ''
    for j in range(len(lines) - 1, -1, -1):
        if not lines[j].strip():
            continue
        cand, txt = lines[j], lines[j].strip()
        if (len(cand) - len(cand.lstrip())) >= 40 and 1 <= len(txt.split()) <= 4 \
                and not txt.endswith(('.', '!', '?', ',', '”', '’')):
            byline = txt
            lines = lines[:j]
        break
    body, checks, n = number_plain(lines)
    return {'byline': byline, 'body': body, 'checks': checks, 'count': n}


def parse_c2_source_b(qp_pages, questions_page_idx):
    """Source B — the 19th-century extract printed on the page facing the Section A questions,
    under an introduction the board writes itself."""
    idx = questions_page_idx + 1
    if idx >= len(qp_pages):
        raise SystemExit('component 2: no page after the Section A questions for Source B')
    pg = qp_pages[idx]
    if re.search(r'SECTION [AB]:', pg):
        raise SystemExit('component 2: the page after the Section A questions is another section, '
                         'not the Source B extract — refusing')
    lines = strip_furniture(pg.split('\n'))
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    # the board's own introduction: the leading block, ending at the first blank line OR at the
    # sentence that dates the source, whichever comes first
    intro, k = [], 0
    for k, ln in enumerate(lines):
        if not ln.strip():
            break
        intro.append(ln.strip())
        if re.search(r'\b1[5-9]\d\d\b\s*\.?\s*$', ln.strip()):
            k += 1
            break
    else:
        k = len(lines)
    if not intro or len(intro) > 6:
        raise SystemExit(f'component 2 Source B: introduction block read as {len(intro)} lines — refusing')
    body, checks, n = number_plain(lines[k:])
    if not body:
        raise SystemExit('component 2 Source B: no extract body after the introduction')
    return {'intro': ' '.join(intro), 'body': body, 'checks': checks, 'count': n}


# ──────────────────────────────────────── questions ───────────────────────────────────────────
LEAD_IN = re.compile(r'(You should (?:write about|comment on|consider)|Compare)\s*:?\s*$', re.I)
# a person's name: capitalised words, and NEVER swallowing the full stop that ends the sentence
NAME = r'([A-Z][\w\'’\-]+(?:\s+[A-Z][\w\'’\-]+){1,3})'


def quoted_title(text, lead):
    """A title inside the board's curly quotes. The naive non-greedy match stops at the apostrophe
    inside a word — ‘We save people. It’s just our job’ would come back as “We save people. It”.
    The closing quote is the first one NOT followed by a letter (an apostrophe inside a word
    always is: It’s, Scott’s, ’em)."""
    m = re.search(lead + r'[‘\'"](.+?)[’\'"](?![A-Za-z])', text)
    return m.group(1).strip() if m else ''


def first_sentence(text):
    return re.split(r'(?<=[a-z0-9’\'])\.\s+(?=[A-Z])', text, maxsplit=1)[0]


def blank_cell(ln, pattern):
    """Replace a boxed question cell with the same width in spaces, so the first line of a
    question keeps its true column and the indent tests below still work."""
    m = re.match(pattern, ln)
    return (' ' * len(m.group(0))) + ln[m.end():] if m else ln


def paragraphs(kept):
    """Wrapped lines → paragraphs; the board's bullets → markdown bullets; a wrapped a)/b)/c)
    sub-part keeps its own line so its [1] stays attached to the part it belongs to.

    A wrapped bullet/sub-part is indented PAST its own marker; the sentence that follows the list
    ('You must refer to the text…') sits back at the question's own margin. Joining on indent is
    what keeps that sentence out of the last bullet."""
    paras, cur, cont_col = [], [], None
    def flush():
        nonlocal cur
        if cur:
            para = ' '.join(cur)
            m = LEAD_IN.search(para)          # keep the list's lead-in on its own line
            if m and m.start() > 0:
                paras.append(para[:m.start()].strip())
                paras.append(para[m.start():].strip())
            else:
                paras.append(para)
            cur = []
    for ln in kept:
        s = re.sub(r'\s{2,}', ' ', ln.strip())   # the layout's column padding is not prose
        if not s:
            flush()
            cont_col = None
            continue
        indent = len(ln) - len(ln.lstrip())
        m = re.match(r'^([•·]\s*)', s)
        if m:
            flush()
            paras.append('- ' + s[m.end():])
            cont_col = indent + len(m.group(1))
            continue
        m = re.match(r'^([a-c]\)\s+)', s)
        if m:
            flush()
            paras.append(s)
            cont_col = indent + len(m.group(1))
            continue
        if cont_col is not None and not cur and indent >= cont_col - 1:
            paras[-1] += ' ' + s               # wrapped bullet / sub-part
            continue
        cont_col = None
        cur.append(s)
    flush()
    return [p for p in paras if p]


def finish_question(paras, qn, printed_cell, needs_human):
    """Pull the tariff off the board's own [N] tags, then take the tags out of the prose (the
    Marks field carries them) — except on a sub-part line, where each [1] names its own part."""
    tags = [int(x) for p in paras for x in re.findall(r'\[(\d+)\]', p)]
    out = []
    for p in paras:
        out.append(p if re.match(r'^[a-c]\)\s', p) else re.sub(r'\s*\[\d+\]', '', p).rstrip())
    text = '\n\n'.join(x for x in out if x).strip()
    if not tags:
        needs_human.append(f'Q{qn} (printed {printed_cell}): no [marks] tag found on the paper')
        return text, None
    return text, (sum(tags) if len(tags) > 1 else tags[0])


def rm_front_index(pages, component):
    """The Resource Material's own front page (paper code -1A). Some bundles staple the Resource
    Material onto the end of the question-paper PDF; everything from that page on is the passage,
    not the questions."""
    code = f'C700U{component}0-1A'
    for i, pg in enumerate(pages):
        if code in pg and re.search(r'Resource Material for use with Section A', pg, re.I) \
                and not re.search(r'INSTRUCTIONS TO CANDIDATES', pg):
            return i
    return None


def parse_c1_questions(qp_pages):
    cut = rm_front_index(qp_pages, 1)
    lines = strip_furniture('\n'.join(qp_pages[:cut] if cut is not None else qp_pages).split('\n'))
    starts = []
    for i, ln in enumerate(lines):
        m = re.match(r'^\s*0\s+([1-5])\s+\S', ln)
        if m:
            starts.append((i, int(m.group(1))))
    if [s[1] for s in starts] != [1, 2, 3, 4, 5]:
        raise SystemExit(f'component 1: expected the cells 0 1 … 0 5 in order, found {[s[1] for s in starts]}')
    sec_b = next((i for i, ln in enumerate(lines)
                  if re.search(r'quality of your creative prose writing skills', ln)), None)
    if sec_b is None:
        raise SystemExit('component 1: no Section B heading in the question paper')

    qs, needs_human = {}, []
    for idx, (i, qn) in enumerate(starts):
        end = starts[idx + 1][0] if idx + 1 < len(starts) else sec_b
        block = [blank_cell(lines[i], r'^\s*0\s+[1-5]\s+')] + lines[i + 1:end]
        text, marks = finish_question(paragraphs(block), qn, C1_PRINTED[qn], needs_human)
        qs[qn] = {'text': text, 'marks': marks}

    # Section B: the board's guidance, then the four titles from the repeated '1 1 x)' cell.
    # The cell is the same box ('1 1') for every title and the tab layout breaks it up in three
    # different ways across sittings: '1 1 a) text' · '1' then '1 b) text' · '1 1 text' then 'c)'.
    guide, titles, cur_letter, cur, pending = [], [], None, [], None
    def close():
        nonlocal cur_letter, cur
        if cur_letter:
            titles.append((cur_letter, ' '.join(cur).strip()))
        cur_letter, cur = None, []
    for ln in lines[sec_b:]:
        s = ln.strip()
        if not s:
            continue
        if re.match(r'^(Either|Or)\s*,?\s*$', s, re.I):
            continue
        m = re.match(r'^(?:1\s+)+([a-d])\)\s*(.*)$', s)
        if m:
            close()
            cur_letter, cur = m.group(1), ([m.group(2).strip()] if m.group(2).strip() else [])
            pending = None
            continue
        m = re.match(r'^([a-d])\)\s*(.*)$', s)
        if m and pending is not None:          # the letter printed under its own title text
            close()
            cur_letter = m.group(1)
            cur = [pending] + ([m.group(2).strip()] if m.group(2).strip() else [])
            pending = None
            continue
        m = re.match(r'^(?:1\s+)+(\S.*)$', s)
        if m:                                   # cell whose letter is printed on the NEXT line
            close()
            pending = m.group(1).strip()
            continue
        if re.match(r'^1\s*$', s):
            continue
        if cur_letter:
            cur.append(s)
        elif pending is not None:
            pending += ' ' + s
        else:
            guide.append(s)
    close()
    if [t[0] for t in titles] != ['a', 'b', 'c', 'd']:
        raise SystemExit(f'component 1 Section B: expected titles a)–d), found {[t[0] for t in titles]}')
    gtext = ' '.join(guide)
    m = re.search(r'\[(\d+)\]', gtext)
    if not m:
        needs_human.append('Q6 (printed 1 1): no [marks] tag on the Section B instruction')
    q6 = []
    lead = re.sub(r'\s*\[\d+\]', '', gtext)
    for sent in ['Choose one of the following titles for your writing:']:
        if sent in lead:
            pre, post = lead.split(sent, 1)
            if pre.strip():
                q6.append(pre.strip())
            q6.append(sent)
            lead = post
            break
    if lead.strip():
        q6.append(lead.strip())
    for letter, txt in titles:
        q6.append(f'**({letter})** {txt}')
    qs[6] = {'text': '\n\n'.join(q6).strip(), 'marks': int(m.group(1)) if m else None}
    return qs, needs_human


def parse_c2_questions(qp_pages):
    """Section A's six cells sit on one page; Section B's two on another. Returns the questions
    and the index of the Section A questions page (Source B is printed on the page after it)."""
    a_idx = next((i for i, pg in enumerate(qp_pages)
                  if re.search(r'^\s*1\s+1\s+a\)', pg, re.M)), None)
    b_idx = next((i for i, pg in enumerate(qp_pages)
                  if re.search(r'Answer Question\s+2\s+1\s+and Question\s+2\s+2', pg)), None)
    if a_idx is None:
        raise SystemExit('component 2: no Section A questions page (cell 1 1 a) not found)')
    if b_idx is None:
        raise SystemExit('component 2: no Section B page (the 2 1 / 2 2 instruction not found)')

    qs, needs_human = {}, []
    lines = strip_furniture(qp_pages[a_idx].split('\n'))
    starts = []
    for i, ln in enumerate(lines):
        if re.match(r'^\s*1\s+([1-6])\s+\S', ln):
            starts.append((i, int(re.match(r'^\s*1\s+([1-6])\s+\S', ln).group(1))))
    if [s[1] for s in starts] != [1, 2, 3, 4, 5, 6]:
        raise SystemExit(f'component 2: expected the cells 1 1 … 1 6 in order, found {[s[1] for s in starts]}')
    preamble = ' '.join(l.strip() for l in lines[:starts[0][0]] if l.strip())
    carry = ''
    for idx, (i, qn) in enumerate(starts):
        end = starts[idx + 1][0] if idx + 1 < len(starts) else len(lines)
        block = [blank_cell(lines[i], r'^\s*1\s+[1-6]\s+')] + lines[i + 1:end]
        paras = paragraphs(block)
        # 'To answer the following questions you must…' sits BETWEEN two cells: it tells the
        # student what to read for the questions that FOLLOW, so it belongs to the next one
        nav = []
        while paras and re.match(r'^To answer the following question', paras[-1], re.I):
            nav.insert(0, paras.pop())
        text, marks = finish_question(paras, qn, C2_PRINTED[qn], needs_human)
        qs[qn] = {'text': (carry + '\n\n' + text).strip() if carry else text, 'marks': marks}
        carry = '\n\n'.join(nav)
    if carry:
        qs[6]['text'] = (qs[6]['text'] + '\n\n' + carry).strip()

    lines = strip_furniture(qp_pages[b_idx].split('\n'))
    starts = []
    for i, ln in enumerate(lines):
        if re.match(r'^\s*2\s+([12])\s+\S', ln):
            starts.append((i, int(re.match(r'^\s*2\s+([12])\s+\S', ln).group(1))))
    if [s[1] for s in starts] != [1, 2]:
        raise SystemExit(f'component 2: expected the cells 2 1 and 2 2, found {[s[1] for s in starts]}')
    guide = [l.strip() for l in lines[:starts[0][0]]
             if l.strip() and not re.match(r'Answer Question', l.strip())]
    for idx, (i, sub) in enumerate(starts):
        end = starts[idx + 1][0] if idx + 1 < len(starts) else len(lines)
        qn = 6 + sub
        block = [blank_cell(lines[i], r'^\s*2\s+[12]\s+')] + lines[i + 1:end]
        text, marks = finish_question(paragraphs(block), qn, C2_PRINTED[qn], needs_human)
        qs[qn] = {'text': text, 'marks': marks}
    return qs, needs_human, a_idx, preamble, ' '.join(guide)


# ────────────────────────────────── mark-scheme AO assertion ──────────────────────────────────
def assert_ms_aos(ms_path, component, needs_human):
    """The AO map above came off the board's mark schemes. When this sitting's own mark scheme is
    supplied, check it agrees — a divergence is reported, never absorbed."""
    if not ms_path:
        return {'checked': False, 'reason': 'no --ms supplied'}
    raw = subprocess.run(['pdftotext', '-layout', ms_path, '-'], check=True,
                         capture_output=True, text=True).stdout
    cell = r'^\s*0\s+([1-5])\b' if component == 1 else r'^\s*1\s+([1-6])\b'
    want = C1_AOS if component == 1 else C2_AOS
    found, current = {}, None
    for ln in raw.split('\n'):
        s = ln.strip()
        m = re.match(cell, s)
        if m:
            current = int(m.group(1))
            continue
        m = re.match(r'^\(AO(\d)\b', s)
        if m and current and current not in found:
            found[current] = 'AO' + m.group(1)
    res = {'checked': True, 'read': found}
    for qn, ao in found.items():
        if want[qn].split(',')[0].strip() != ao:
            needs_human.append(f'Q{qn}: the mark scheme annotates {ao}, the AO map says {want[qn]}')
    missing = [qn for qn in want if qn <= (5 if component == 1 else 6) and qn not in found]
    if missing:
        res['not_annotated_in_this_ms'] = missing
    return res


# ───────────────────────────────────────── emit ───────────────────────────────────────────────
def render_body(md, body):
    for n, txt in body:
        md.append('' if n is None else f'{n:<3}{txt}')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--board', default='eduqas')
    ap.add_argument('--component', required=True, choices=['1', '2'])
    ap.add_argument('--sitting', required=True, help='YYYYMM of the printed exam date')
    ap.add_argument('--qp', required=True)
    ap.add_argument('--ins', help='standalone Resource Material PDF (Component 1, when not stapled to the QP)')
    ap.add_argument('--ms')
    ap.add_argument('--out', required=True)
    a = ap.parse_args()
    if a.board != 'eduqas':
        raise SystemExit('this tool authors Eduqas only — AQA has live-model-author-paper.py')
    component = int(a.component)

    qp_pages = pdf_pages(a.qp)
    ins_pages = pdf_pages(a.ins) if a.ins else None
    front = read_front(qp_pages, component)
    if not front:
        raise SystemExit('front page: no printed exam date found — refusing (the sitting must be '
                         'read off the paper, never assumed)')
    printed_sitting = f'{front["year"]}{front["month"]:02d}'
    if printed_sitting != a.sitting:
        raise SystemExit(f'--sitting {a.sitting} but the paper is dated {front["printed_date"]} '
                         f'({printed_sitting}) — refusing')
    sitting_label = f'{MONTH_WORD[front["month"]]} {front["year"]}'
    topic_number = int(a.sitting)

    needs_human, notes, sources = [], [], {}

    if component == 1:
        src = parse_c1_source(c1_source_pages(qp_pages, ins_pages))
        qs, nh = parse_c1_questions(qp_pages)
        needs_human += nh
        MARKS, AOS, PRINTED = C1_MARKS, C1_AOS, C1_PRINTED
        if not src['title']:
            src['title'] = 'Untitled prose extract'
            notes.append("Eduqas prints no title above the Component 1 passage for this sitting — "
                         "Title written as 'Untitled prose extract'")
        if not src['author']:
            src['author'] = 'Unknown'
            notes.append('Eduqas prints no author for this passage (no byline, no acknowledgement '
                         'anywhere in the paper) — Author written as Unknown')
        sources['A'] = {'label': 'Source A', 'title': src['title'], 'author': src['author'],
                        'context': src['context'], 'body': src['body'], 'checks': src['checks'],
                        'count': src['count'], 'markers': 'board-printed (line 1, then every fifth line)'}
        paper_name = '20th Century Literature Reading and Creative Prose Writing'
        paper_desc = ('One fiction source, six questions, 80 marks total. Section A tests reading '
                      '(Q1–Q5, 40 marks), Section B tests creative prose writing (Q6, 40 marks). '
                      'You have 1 hour 45 minutes.')
        paper_aos = 'AO1, AO2, AO4, AO5, AO6'
    else:
        qs, nh, a_idx, preamble, sec_b_guide = parse_c2_questions(qp_pages)
        needs_human += nh
        sa = parse_c2_source_a(qp_pages)
        sb = parse_c2_source_b(qp_pages, a_idx)
        MARKS, AOS, PRINTED = C2_MARKS, C2_AOS, C2_PRINTED

        # Source A identity, in descending order of what the board actually prints
        a_title = quoted_title(preamble, r'newspaper article,\s*')
        a_author, a_from = '', ''
        for pat, where, src in (
                (r'[’\'"]\s*,?\s*by\s+' + NAME, 'the Section A preamble’s “by …”', preamble),
                (r'the writer,\s*' + NAME, 'the wording of question 1 2', qs[2]['text']),
                (r'Reporter\s+' + NAME, 'the article’s own standfirst', '\n'.join(t for _, t in sa['body']))):
            m = re.search(pat, src)
            if m:
                a_author, a_from = m.group(1).strip(), where
                break
        if not a_author and sa['byline']:
            a_author, a_from = sa['byline'], 'the byline at the foot of the article'
        if not a_title:
            needs_human.append('Source A: the board names no article title in the Section A preamble')
            a_title = '[NEEDS HUMAN: article title]'
        if not a_author:
            a_author = 'Unknown'
            notes.append('Source A carries no byline and the paper never names its writer — '
                         'Author written as Unknown')
        elif 'preamble' not in a_from:
            notes.append(f'Source A has no byline; the writer’s name was taken from {a_from}')

        # Source B identity — the board describes it twice: once in the Section A preamble and
        # once in the introduction printed above the extract. Read the preamble first (it is the
        # fuller of the two: “from Matthew Scott’s autobiography” vs “from Scott’s autobiography”).
        b_title, b_author, b_year = '', '', ''
        m = re.search(r'The (?:extract|account|passage) on the opposite page.*', preamble, re.S)
        said = first_sentence(m.group(0)) if m else ''
        if not said:
            needs_human.append('Source B: the Section A preamble never says what the facing-page '
                               'extract is — refusing to name it')
        for where in (said, sb['intro']):
            m = re.search(r'\b1[5-9]\d\d\b', where)
            if m and not b_year:
                b_year = m.group(0)
            if not b_title:
                b_title = quoted_title(where, r'')
            m = re.search(NAME + r'[’\']s\s+(autobiography|diary|journal|memoir|account|letters)', where)
            if m and not b_author:
                b_author = m.group(1).strip()
                if not b_title:
                    b_title = f'{m.group(1).strip()}’s {m.group(2)}'
        if not b_title:
            m = re.search(r'appeared in the ([A-Z][\w]*(?:\s+[A-Z][\w]*){0,3})\s+'
                          r'(?:newspaper\s+)?in\s+1[5-9]\d\d', said + ' ' + sb['intro'])
            if m:
                b_title = m.group(1).strip() + (f' ({b_year})' if b_year else '')
                notes.append(f'Eduqas prints no title for Source B — the board’s own name for the '
                             f'publication was used ({b_title})')
        if not b_title:
            needs_human.append('Source B: no title, publication or named work in the board’s introduction')
            b_title = '[NEEDS HUMAN: Source B title]'
        if not b_author:
            b_author = f'Unknown ({b_year})' if b_year else 'Unknown'
            notes.append(f'Source B is unattributed in the board’s introduction '
                         f'(“{sb["intro"][:90]}…”) — Author written as {b_author}')
        # the preamble describes both sources; give each the sentences that are about it
        a_context = ' '.join(s for s in re.split(r'(?<=\.)\s+(?=[A-Z])', preamble)
                             if 'opposite page' not in s).strip()
        sources['A'] = {'label': 'Source A', 'title': a_title, 'author': a_author,
                        'context': a_context, 'body': sa['body'], 'checks': sa['checks'],
                        'count': sa['count'], 'markers': 'authored (Eduqas prints none on Component 2)'}
        sources['B'] = {'label': 'Source B', 'title': b_title, 'author': b_author,
                        'context': sb['intro'], 'body': sb['body'], 'checks': sb['checks'],
                        'count': sb['count'], 'markers': 'authored (Eduqas prints none on Component 2)'}
        paper_name = '19th and 21st Century Non-Fiction Reading and Transactional/Persuasive Writing'
        paper_desc = ('Two non-fiction sources, eight questions, 80 marks total. Section A tests '
                      'reading (Q1–Q6, 40 marks), Section B tests transactional and persuasive '
                      'writing (Q7 and Q8, 20 marks each). You have 2 hours.')
        paper_aos = 'AO1, AO2, AO3, AO4, AO5, AO6'

    # tariff — the board's own printed tags, checked against the specification's shape
    total = 0
    for qn in sorted(MARKS):
        got = qs[qn]['marks']
        if got is None:
            qs[qn]['marks'] = MARKS[qn]
            got = MARKS[qn]
        if got != MARKS[qn]:
            raise SystemExit(f'Q{qn} (printed {PRINTED[qn]}) carries {got} marks on the paper, '
                             f'the Eduqas Component {component} specification says {MARKS[qn]} — refusing')
        total += got
    if total != 80:
        raise SystemExit(f'tariff sums to {total}, not 80 — refusing')
    ms_check = assert_ms_aos(a.ms, component, needs_human)

    titles = ' / '.join(f"{sources[L]['title']} ({sources[L]['author']})" for L in sorted(sources))
    label = f'Eduqas Language Component {component} — {sitting_label} · {titles}'

    md = [f'# Topic {topic_number}: {label}',
          '**Type:** language_paper',
          '**Format:** multi_question',
          f'**Teaching Point:** Eduqas Language Component {component} — {paper_name}, '
          f'{sitting_label} sitting. {paper_desc}',
          '**Marks:** 80',
          f'**AOs:** {paper_aos}',
          '']
    for L in sorted(sources):
        s = sources[L]
        md.append(f'## Source {L}')
        md.append(f"**Title:** {s['title']}")
        md.append(f"**Author:** {s['author']}")
        if s['context']:
            md.append(f"**Context:** {s['context']}")
        md.append('')
        render_body(md, s['body'])
        md.append('')
    for qn in sorted(MARKS):
        md.append(f'## Q{qn}')
        md.append(f"**Marks:** {qs[qn]['marks']}")
        md.append(f'**AOs:** {AOS[qn]}')
        md.append('')
        md.append(qs[qn]['text'])
        md.append('')
    md.append('---')

    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    open(a.out, 'w', encoding='utf-8').write('\n'.join(md) + '\n')

    text_slug = f'eduqas_lang_paper_{component}'
    side = {
        'topic_number': topic_number, 'board': 'eduqas', 'text': text_slug,
        'store': f'swml_topics_eduqas_{text_slug}', 'label': label,
        'sitting': {'code': a.sitting, 'printed_date': front['printed_date'], 'label': sitting_label},
        'sources': {L: {'line_count': sources[L]['count'], 'line_checks': sources[L]['checks'],
                        'line_markers': sources[L]['markers']} for L in sorted(sources)},
        'questions': {f'Q{qn}': qs[qn]['marks'] for qn in sorted(MARKS)},
        'printed_cells': {f'Q{qn}': PRINTED[qn] for qn in sorted(MARKS)},
        'total_marks': total,
        # Q1's SHAPE, declared rather than inferred. live-model-paper-gate.php currently reads
        # "two sources" as "AQA Paper 2, so Q1 is eight true/false statements"; Eduqas Component 2
        # also has two sources but its Q1 is three one-mark retrieval parts. See GATE-NOTES.md.
        'q1_format': 'sub_parts' if component == 2 else 'open',
        'ao_source': ('Eduqas mark schemes: Component 1 Summer 2023; Component 2 Autumn 2021 and '
                      'Autumn 2022 (they agree)'),
        'ms_ao_check': ms_check,
        'provenance': {'qp': os.path.basename(a.qp), 'qp_sha1': sha1(a.qp),
                       'ins': os.path.basename(a.ins) if a.ins else None,
                       'ins_sha1': sha1(a.ins) if a.ins else None,
                       'ms': os.path.basename(a.ms) if a.ms else None,
                       'ms_sha1': sha1(a.ms) if a.ms else None},
        'needs_human': needs_human, 'notes': notes,
    }
    open(re.sub(r'\.md$', '', a.out) + '.checks.json', 'w', encoding='utf-8').write(
        json.dumps(side, indent=2, ensure_ascii=False) + '\n')

    print(f'✓ {a.out}')
    print(f'  {label}')
    print('  ' + '  '.join(f"Source {L}: {sources[L]['count']} lines, "
                           f"{len(sources[L]['checks'])} markers ({sources[L]['markers'].split(' ')[0]})"
                           for L in sorted(sources)))
    print(f"  tariff={side['questions']} total={total}")
    if needs_human:
        print('  NEEDS HUMAN: ' + ' | '.join(needs_human))
    if notes:
        print('  note: ' + ' | '.join(notes))


if __name__ == '__main__':
    main()
