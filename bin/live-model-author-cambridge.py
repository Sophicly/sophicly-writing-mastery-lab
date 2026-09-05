#!/usr/bin/env python3
"""
live-model-author-cambridge.py — author a LIVE MODELLING Cambridge IGCSE past-paper topic from
Cambridge's OWN PDFs (0500 / 0990 First Language English). Twin of live-model-author-paper.py.

    live-model-author-cambridge.py --paper 1 --sitting 202406 --variant 2 \
        --ins 0500_s24_in_12.pdf --qp 0500_s24_qp_12.pdf \
        --out bin/live-modelling-papers/cambridge-igcse/cambridge_igcse_lang_paper_1/2024062.md

Emits the plugin's topic-template markdown (the grammar SWML_Topic_Parser already parses — one
vocabulary, no second writer) plus a `.checks.json` sidecar the gate asserts against.

Everything is Cambridge's own words. The tool REFUSES rather than approximates:
  · every printed line marker in the insert must land on the reconstructed line of that number,
    and the marker count must equal floor(lines / 5) — Cambridge numbers every fifth line;
  · every [N] mark tag on the question paper, in order, must equal the board's own measured
    skeleton (CAMBRIDGE-PAPER-SPEC.md), and each question's tags must sum to its printed
    [Total: N];
  · every "Re-read paragraph N ('First words ... last words.')" citation on the question paper
    must resolve against the reconstructed paragraphs of the insert (this is what proves the
    page-break decisions, which the PDF text layer cannot state).
Anything unresolved is written to needs_human[] and the sidecar, never guessed.

0500 and 0990 are the SAME paper — measured, see CAMBRIDGE-PAPER-SPEC.md — so one 0500 PDF
authors the topic for both syllabus codes.
"""
import argparse, hashlib, json, os, re, subprocess, sys

SERIES = {'03': 'March', '06': 'June', '11': 'November'}

# Cambridge's own mark skeleton, identical on 40/40 real Paper 1s 2020-2025 (CAMBRIDGE-PAPER-SPEC.md)
P1_SKELETON = [1, 2, 2, 2, 2, 3, 3, 15, 1, 1, 1, 1, 1, 1, 1, 3, 15, 25]
P1_TOTALS   = {'Q1': 30, 'Q2': 25, 'Q3': 25}
P1_AOS      = {'Q1': 'AO1, AO2', 'Q2': 'AO2', 'Q3': 'AO1, AO2, AO3'}
P2_AOS      = {'Q1': 'AO1, AO2, AO3', 'Q2': 'AO1, AO2'}

FURNITURE = re.compile(
    r'^(©\s*UCLES|\d\d_0\d{3}_\d\d_\d{4}_[\d.]+|\[?Turn over|\[Turn to page|Permission to reproduce'
    r'|reasonable effort has been made|To avoid the issue|Assessment International Education Copyright'
    r'|at www\.cambridgeinternational|Cambridge Assessment International|Local Examinations Syndicate'
    r'|This document has|BLANK PAGE|DO NOT WRITE IN THIS MARGIN|Additional Page'
    r'|If you use the following|publisher will be pleased|Please write your chosen question number'
    r'|(?:the )?question number(?:s| or numbers)? must be clearly shown|must be clearly shown'
    r'|Cambridge Local Examinations Syndicate|which itself is a department)', re.I)

INLINE_JUNK = [
    (re.compile(r'[^\x00-\x7f\s]{6,}'), ' '),                       # barcode glyph rows
    (re.compile(r'\b0\d{3}/\d{2}(?:/[A-Z])+/\d{2}\b'), ' '),         # 0500/22/M/J/24
    (re.compile(r'\[?Turn over\b'), ' '),
    (re.compile(r'Please write your chosen question number here[^.]*:'), ' '),
]


def scrub(s):
    for rx, rep in INLINE_JUNK:
        s = rx.sub(rep, s)
    return re.sub(r'\s{2,}', ' ', s).strip()

HEAD  = re.compile(r'^\s*Text\s+([ABC])\s*(?::\s*(.*?))?\s*$')
# some inserts print no heading — the introduction itself opens "Text B is taken from …"
HEAD_INLINE = re.compile(r'^\s*(Text\s+([ABC])\s+(?:is|was)\b.*)$')
END_OF_TEXTS = re.compile(r'^Permission to reproduce items', re.I)
FOOTNOTE = re.compile(r'^\d[A-Za-z]')
SCENE_BREAK = re.compile(r'^[*\s]{3,}$')
INSTR = re.compile(r'^(Read|Re-read)\s+(Text\s+[ABC]\b|both texts|the text\b)', re.I)
QHEAD = re.compile(r'^Question\s+([1-5])\s*$', re.I)
QNUM_PART = re.compile(r'^([1-3])\s+(?=\([a-h]\))')
PART  = re.compile(r'^\(([a-h])\)\s*(.*)$')
SUB   = re.compile(r'^\((iv|iii|ii|i|v)\)\s*(.*)$')
TOTAL = re.compile(r'\[Total:\s*(\d+)\]')
MARK  = re.compile(r'\[(\d{1,2})\]\s*$')
BULLET = re.compile(r'^[•·]\s*(.*)$')
CITE_RANGE  = re.compile(r'paragraphs?\s+(\d+)(?:\s+and\s+(\d+))?\s*\(\s*[‘\'"](.+?)\s*(?:\.\.\.|…)\s*(.+?)[’\'"]\s*\)')
CITE_BEGINS = re.compile(r'[Pp]aragraph\s+(\d+)\s+begins\s+[‘\'"](.+?)\s*(?:\.\.\.|…)\s*[’\'"]')


class Refuse(Exception):
    pass


def pdfpages(path):
    out = subprocess.run(['pdftotext', '-layout', path, '-'], check=True, capture_output=True, text=True).stdout
    out = re.sub(r'[\x00-\x08\x0b\x0e-\x1f]', '', out)   # crop-mark / barcode control bytes
    return out.split('\x0c')


def sha1(path):
    h = hashlib.sha1()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 16), b''):
            h.update(chunk)
    return h.hexdigest()


def is_furniture(s):
    """Page furniture, barcodes and the glyph-font barcode rows pdftotext renders as mojibake."""
    if FURNITURE.match(s):
        return True
    if re.fullmatch(r'\d{1,2}', s):                       # page number
        return True
    if re.fullmatch(r'[,\s]+', s):                        # the ",       ," crop marks
        return True
    if re.fullmatch(r'\*[\s\d]*\*', s):                   # *0019655453502*
        return True
    if not re.search(r'[A-Za-z]', s) and sum(1 for c in s if 0x100 <= ord(c) <= 0x2ff) >= 4:
        return True
    return False


# ─────────────────────────────────────────────── INSERT ───────────────────────────────────────
def strip_marker(raw):
    """Cambridge prints its line markers in the RIGHT margin, every fifth line."""
    s = raw.rstrip()
    m = re.match(r'^(.*?\S)\s{2,}(\d{1,3})$', s)
    if m and (len(s) - len(m.group(2))) >= 80:
        return m.group(1).strip(), int(m.group(2))
    return s.strip(), None


def parse_insert(path, letters, optional=()):
    """→ {letter: {title, context, body:[(n|None, text)], checks:{n: first32}, count, page_breaks}}"""
    toks, done = [], False          # ('L', raw) | ('B',) blank | ('P',) page break
    for pi, page in enumerate(pdfpages(path)):
        if done:
            break
        if pi:
            toks.append(('P',))
        for raw in page.split('\n'):
            s = raw.strip()
            if END_OF_TEXTS.match(s):
                done = True
                break
            lone = re.fullmatch(r'\s{80,}(\d{1,3})\s*', raw.rstrip())
            if lone and int(lone.group(1)) % 5 == 0:
                toks.append(('M', int(lone.group(1))))
            elif not s:
                toks.append(('B',))
            elif not is_furniture(s):
                toks.append(('L', raw.rstrip()))

    heads = {}
    for i, t in enumerate(toks):
        if t[0] != 'L':
            continue
        m = HEAD.match(t[1])
        if m and m.group(1) not in heads:
            heads[m.group(1)] = (i, (m.group(2) or '').strip(), '')
            continue
        m = HEAD_INLINE.match(t[1])
        if m and m.group(2) not in heads:
            heads[m.group(2)] = (i, '', m.group(1).strip())
    missing = [L for L in letters if L not in heads and L not in optional]
    if missing:
        raise Refuse(f'insert: no "Text {"/".join(missing)}" heading found')
    letters = [L for L in letters if L in heads]

    out = {}
    for L in letters:
        i, title, inline_ctx = heads[L]
        j = i + 1
        while j < len(toks) and toks[j][0] != 'L':
            j += 1
        block = []
        while j < len(toks):
            t = toks[j]
            mi = HEAD_INLINE.match(t[1]) if t[0] == 'L' else None
            if t[0] == 'L' and (HEAD.match(t[1]) or (mi and mi.group(2) != L) or INSTR.match(t[1].strip())):
                break
            block.append(t)
            j += 1
        while block and block[-1][0] not in ('L', 'M'):
            block.pop()
        if not block:
            raise Refuse(f'insert Text {L}: no body lines')
        foot = []
        while True:
            k = len(block) - 1
            while k >= 0 and block[k][0] == 'L':
                k -= 1
            if k < 0 or not FOOTNOTE.match(block[k + 1][1].strip()):
                break
            foot = [t[1].strip() for t in block[k + 1:] if t[0] == 'L'] + foot
            block = block[:k + 1]
            while block and block[-1][0] != 'L':
                block.pop()
        if any(t[0] == 'L' and 'Content removed due' in t[1] for t in block):
            raise Refuse(f'insert Text {L}: Cambridge has removed the text for copyright — the words are not in the PDF')
        # Cambridge usually prints an italic standfirst under the title, but some texts have none.
        # Only ONE of the two readings can put the printed marker 5 on reconstructed line 5, so the
        # board's own markers choose between them — nothing is assumed.
        k = 0
        while k < len(block) and block[k][0] == 'L':
            k += 1
        m = k
        while m < len(block) and block[m][0] != 'L':
            m += 1
        stand = ' '.join(t[1].strip() for t in block[:k])
        errs = []
        # Cambridge prints an introduction under most headings but not all, and numbers the scene
        # rule ('***') on some papers and not others. Both are read off the printed markers rather
        # than assumed: only one combination can put every marker on its own line.
        readings = [(block, inline_ctx, 'heading is the introduction')] if inline_ctx else \
                   [(block[m:], stand, 'introduction skipped'), (block, '', 'no introduction')]
        for body, ctx, why in readings:
            if not body:
                continue
            for count_scene in (True, False):
                try:
                    out[L] = number_body(L, body, title, ctx, count_scene)
                    out[L]['footnotes'] = foot
                    out[L]['reading'] = why + ('' if count_scene else ', scene rule not numbered')
                    break
                except Refuse as e:
                    errs.append(str(e))
            if L in out:
                break
        if L not in out:
            raise Refuse(' / '.join(errs))
    return out


def number_body(L, body, title, context, count_scene=True):
    rendered, checks, breaks = [], {}, []
    n, blank, pbreak, last_txt, pending = 0, False, False, '', None
    for t in body:
        if t[0] == 'B':
            blank = True
            continue
        if t[0] == 'P':
            pbreak = True
            continue
        if t[0] == 'M':
            # the marker for a short line sits on its own row: it names the line just written,
            # or the one about to be — anything else is a mis-read and refuses
            if t[1] == n:
                checks[str(n)] = rendered[-1][1][:32]
            elif t[1] == n + 1:
                pending = t[1]
            else:
                raise Refuse(f'Text {L}: lone printed marker {t[1]} at reconstructed line {n}')
            continue
        txt, marker = strip_marker(t[1])
        if SCENE_BREAK.match(txt) and not count_scene:
            rendered.append((None, ''))       # some papers print the scene rule off the line grid
            rendered.append((None, txt))
            blank = True
            continue
        if pbreak:
            # The text layer cannot say whether a page break is also a paragraph break, so it is read
            # off the words either side: a paragraph continues across the break unless the line before
            # it finishes a sentence AND the line after it opens a new one. Every decision is recorded
            # and cross-checked against the question paper's own paragraph citations.
            ends = bool(re.search(r'[.!?][”’"\')]*$', last_txt))
            opens = bool(txt[:1].isupper() or txt[:1] in '‘“"')
            is_para = ends and opens
            breaks.append({'after_line': n, 'previous_line_ends_a_sentence': ends,
                           'next_line_opens_one': opens, 'paragraph_break': is_para})
            blank = is_para
            pbreak = False
        if blank and rendered:
            rendered.append((None, ''))
        blank = False
        n += 1
        if pending is not None:
            if pending != n:
                raise Refuse(f'Text {L}: lone printed marker {pending} landed on reconstructed line {n}')
            checks[str(n)] = txt[:32]
            pending = None
        if marker is not None:
            if marker != n or n % 5:
                raise Refuse(f'Text {L}: printed marker {marker} landed on reconstructed line {n} ({txt[:40]!r})')
            checks[str(n)] = txt[:32]
        rendered.append((n, txt))
        last_txt = txt
    if len(checks) != n // 5:
        raise Refuse(f'Text {L}: {len(checks)} printed markers for {n} lines — Cambridge numbers every fifth line, so {n // 5} were due')
    return {'title': title, 'context': context, 'body': rendered, 'checks': checks, 'count': n,
            'page_breaks': breaks, 'footnotes': [], 'reading': ''}


def paragraphs(src):
    """The reconstructed text as paragraphs, in the order Cambridge's questions count them."""
    paras, cur = [], []
    for n, txt in src['body']:
        if n is None:
            if cur:
                paras.append(' '.join(cur))
                cur = []
        else:
            cur.append(txt)
    if cur:
        paras.append(' '.join(cur))
    return paras


# ─────────────────────────────────────────── QUESTION PAPER ───────────────────────────────────
def qp_lines(path):
    """→ [(indent_normalised_within_page, text)] with answer dots, furniture and barcodes gone."""
    kept = []
    for page in pdfpages(path):
        page_lines = []
        for raw in page.split('\n'):
            s = raw.strip()
            if not s or is_furniture(s):
                continue
            s = scrub(re.sub(r'\.{4,}', ' ', s))
            if not s or is_furniture(s) or s in ('•', '·'):
                continue
            page_lines.append((len(raw) - len(raw.lstrip()), s))
        if page_lines:
            off = min(i for i, _ in page_lines)
            kept += [(i - off, s) for i, s in page_lines]
    return kept


def add_seg(node, text, bullet=False, indent=0):
    segs = node['segs']
    if bullet:
        node['bullet_indent'] = indent
        segs.append('• ' + text)
        return
    if segs and segs[-1].startswith('• ') and indent <= node.get('bullet_indent', 0):
        segs.append(text)
    elif segs:
        segs[-1] = (segs[-1] + ' ' + text).strip()
    else:
        segs.append(text)


def parse_nodes(block):
    """A question's lines → ordered nodes: instruction notes, lettered parts, roman sub-parts."""
    nodes, part, sub, cur = [], None, None, None
    for indent, s in block:
        s = QNUM_PART.sub('', TOTAL.sub('', s).strip()).strip()
        if not s or QHEAD.match(s):
            continue
        marks = None
        mm = MARK.search(s)
        if mm:
            marks = int(mm.group(1))
            s = s[:mm.start()].strip()
        if INSTR.match(s):
            part = sub = None
            cur = {'kind': 'note', 'segs': [], 'instr': True}
            nodes.append(cur)
            if s:
                add_seg(cur, s, indent=indent)
            continue
        mp = PART.match(s)
        ms = SUB.match(s)
        if mp:
            part = {'kind': 'part', 'label': mp.group(1), 'segs': [], 'marks': None, 'subs': []}
            nodes.append(part)
            sub, cur = None, part
            s = mp.group(2).strip()
        elif ms and part is not None:
            sub = {'label': ms.group(1), 'segs': [], 'marks': None}
            part['subs'].append(sub)
            cur = sub
            s = ms.group(2).strip()
        if s:
            if cur is None or (cur.get('instr') and cur['segs'] and cur['segs'][-1].endswith('.')):
                cur = {'kind': 'note', 'segs': []}
                nodes.append(cur)
            mb = BULLET.match(s)
            if mb:
                add_seg(cur, mb.group(1).strip(), bullet=True, indent=indent)
            else:
                add_seg(cur, s, indent=indent)
        if marks is not None:
            if cur is None:
                cur = {'kind': 'note', 'segs': []}
                nodes.append(cur)
            cur['marks'] = marks
    return nodes


def render_nodes(nodes):
    segs, seq = [], []
    for nd in nodes:
        if nd['kind'] == 'note':
            segs += nd['segs']
            if nd.get('marks') is not None:
                seq.append(nd['marks'])
                if segs:
                    segs[-1] += f" **[{nd['marks']}]**"
            continue
        body = list(nd['segs']) or ['']
        body[0] = f"**({nd['label']})** " + body[0]
        if nd['marks'] is not None:
            seq.append(nd['marks'])
            body[-1] += f" **[{nd['marks']}]**"
        segs += [b.strip() for b in body]
        for sb in nd['subs']:
            line = '&nbsp;&nbsp;&nbsp;&nbsp;**(' + sb['label'] + ')** ' + ' '.join(sb['segs']).strip()
            if sb['marks'] is not None:
                seq.append(sb['marks'])
                line += f" **[{sb['marks']}]**"
            segs.append(line.strip())
    return '\n\n'.join(s for s in segs if s), seq


def parse_qp_p1(path):
    lines = qp_lines(path)
    seen, heads = {}, []
    for i, (_, s) in enumerate(lines):
        m = QHEAD.match(s) or QNUM_PART.match(s)
        if m and m.group(1) not in seen:
            seen[m.group(1)] = i
            heads.append(i)
    if sorted(seen) != ['1', '2', '3']:
        raise Refuse(f'qp: expected the three "Question N" headings, found {sorted(seen)}')
    starts = []
    for h in heads:                      # the "Read Text X …" instruction sits just above the heading
        j = h
        for k in range(h - 1, max(-1, h - 4), -1):
            if INSTR.match(lines[k][1]):
                j = k
        starts.append(j)
    last = max(i for i, (_, s) in enumerate(lines) if MARK.search(s) or TOTAL.search(s))
    bounds = starts + [last + 1]
    qs, seq = {}, []
    for k in range(3):
        qid = f'Q{k + 1}'
        block = lines[bounds[k]:bounds[k + 1]]
        printed = [int(m.group(1)) for _, s in block for m in [TOTAL.search(s)] if m]
        text, s = render_nodes(parse_nodes(block))
        if not s:
            raise Refuse(f'qp: {qid} carries no [N] mark tags')
        if printed and (len(printed) > 1 or sum(s) != printed[0]):
            raise Refuse(f'qp: {qid} mark tags {s} sum to {sum(s)} against printed {printed}')
        if sum(s) != P1_TOTALS[qid]:
            raise Refuse(f'qp: {qid} sums to {sum(s)}, Cambridge Paper 1 gives {P1_TOTALS[qid]}')
        qs[qid] = {'text': text, 'marks': sum(s), 'part_marks': s}
        seq += s
    if seq != P1_SKELETON:
        raise Refuse(f'qp: mark skeleton {seq} is not Cambridge Paper 1\'s own {P1_SKELETON}')
    return qs


def section_marks(block, label):
    """Cambridge states each section's split in words ("Up to 15 marks … up to 25 marks") and
    usually prints [40] as well. Take the split, and assert the printed tag against it."""
    split = [int(m.group(1)) for _, t in block for m in re.finditer(r'[Uu]p to (\d+) marks', t)]
    printed = [int(m.group(1)) for _, t in block for m in [MARK.search(t)] if m]
    if len(split) != 2:
        raise Refuse(f'qp: {label} states {len(split)} mark splits ("Up to N marks"), expected 2')
    if sum(split) != 40:
        raise Refuse(f'qp: {label} split {split} sums to {sum(split)}, Cambridge Paper 2 gives 40')
    if printed and set(printed) != {40}:
        raise Refuse(f'qp: {label} prints mark tags {printed}, expected [40]')
    return 40, split


def parse_qp_p2(path):
    lines = qp_lines(path)
    a = next((i for i, (_, s) in enumerate(lines) if re.match(r'^Read (both texts|Text A)', s, re.I)), None)
    b = next((i for i, (_, s) in enumerate(lines) if re.match(r'^Section B\s*:\s*Composition\s*$', s, re.I)), None)
    if a is None or b is None or b <= a:
        raise Refuse('qp: could not find the Section A instruction and the "Section B: Composition" heading')
    sec_a = [(i, s) for i, s in lines[a:b] if not re.match(r'^Section A\s*:', s, re.I)]
    sec_b = lines[b:]
    marks_a, split_a = section_marks(sec_a, 'Section A')
    marks_b, split_b = section_marks(sec_b, 'Section B')
    text_a, seq_a = render_nodes(parse_nodes(sec_a))
    if not seq_a:
        text_a = text_a.rstrip() + ' **[40]**'

    # Section B: the rubric, then four numbered compositions under Descriptive/Narrative headings.
    rubric, options, genre = [], [], None
    for _, s in sec_b:
        if TOTAL.search(s):
            break
        if re.match(r'^(Section B\s*:\s*Composition|EITHER|OR)\s*$', s, re.I):
            continue
        mg = re.match(r'^(Descriptive|Narrative) Writing\s*$', s, re.I)
        if mg:
            genre = mg.group(1).capitalize() + ' Writing'
            continue
        mo = re.match(r'^([2-5])\s+(\S.*)$', s)
        if mo and genre and int(mo.group(1)) == len(options) + 2:
            options.append({'n': int(mo.group(1)), 'genre': genre, 'text': mo.group(2).strip()})
            continue
        s2 = MARK.sub('', s).strip()
        if options:
            if s2:
                options[-1]['text'] += ' ' + s2
        elif s2:
            rubric.append(s2)
    if [o['n'] for o in options] != [2, 3, 4, 5]:
        raise Refuse(f'qp: Section B options {[o["n"] for o in options]}, expected 2,3,4,5')
    genres = [o['genre'] for o in options]
    if genres.count('Descriptive Writing') != 2 or genres.count('Narrative Writing') != 2:
        raise Refuse(f'qp: Section B genres {genres}, expected two Descriptive and two Narrative')

    body = ['*Section B: Composition — answer ONE question.*', ' '.join(rubric).strip() + ' **[40]**']
    body += [f"**{o['n']}** *({o['genre']})* {o['text']}" for o in options]
    return {'Q1': {'text': text_a, 'marks': marks_a, 'part_marks': split_a},
            'Q2': {'text': '\n\n'.join(body), 'marks': marks_b, 'part_marks': split_b,
                   'options': [{'n': o['n'], 'genre': o['genre']} for o in options]}}


# ───────────────────────────────────── PARAGRAPH CITATION CHECK ───────────────────────────────
def norm(s):
    return re.sub(r'[^a-z0-9 ]', '', re.sub(r'\s+', ' ', s.lower())).strip()


def check_citations(qs, sources):
    """Cambridge cites its own paragraphs — "paragraph N (‘First words ... last words.’)" and
    "Paragraph N begins ‘First words ...’". Each citation is resolved against the reconstructed
    insert. What this PROVES is the paragraph BOUNDARY (and therefore every page-break decision);
    Cambridge does not count a date or sub-heading line as a paragraph, so the printed number is
    recorded as an offset rather than asserted."""
    paras = {L: paragraphs(src) for L, src in sources.items()}
    results, failures = {}, []

    def find_start(head):
        h = norm(head)[:24]
        for L, ps in paras.items():
            for i, p in enumerate(ps):
                if norm(p).startswith(h):
                    return L, i
        return None, None

    def find_end(L, tail):
        t = norm(tail)[-24:]
        for i, p in enumerate(paras[L]):
            if norm(p).endswith(t):
                return i
        return None

    for qid in sorted(qs):
        text = qs[qid]['text']
        for m in CITE_RANGE.finditer(text):
            first, second, head, tail = int(m.group(1)), m.group(2), m.group(3), m.group(4)
            key = f'{qid} paragraph {first}' + (f'-{second}' if second else '')
            L, i = find_start(head)
            if L is None:
                results[key] = f'no paragraph begins {head!r}'
                failures.append(key)
                continue
            j = find_end(L, tail)
            if j is None:
                results[key] = f'no paragraph in Text {L} ends {tail!r}'
                failures.append(key)
                continue
            span = (int(second) - first) if second else 0
            if j - i != span:
                results[key] = f'Text {L}: cited span {span + 1} paragraph(s), found {j - i + 1}'
                failures.append(key)
            else:
                results[key] = f'ok (Text {L}, paragraph {i + 1} here)'
        for m in CITE_BEGINS.finditer(text):
            num, head = int(m.group(1)), m.group(2)
            key = f'{qid} paragraph {num} begins'
            L, i = find_start(head)
            if L is None:
                results[key] = f'no paragraph begins {head!r}'
                failures.append(key)
            else:
                results[key] = f'ok (Text {L}, paragraph {i + 1} here)'
    return results, failures


# ─────────────────────────────────────────────── EMIT ─────────────────────────────────────────
def q3_form(text):
    m = re.search(r'Write the words of (?:the |your |a |an )?([^.]+)\.', text)
    if not m:
        return None
    w = m.group(1).strip().split()[-1]
    return w if re.fullmatch(r"[a-z]+", w) else None


def sec_a_form(text):
    m = re.search(r'Base your (\w+) on what you have read in (?:both texts|the text)', text)
    return m.group(1) if m else None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--paper', required=True, choices=['1', '2'])
    ap.add_argument('--sitting', required=True, help='YYYYMM — 03 March, 06 June, 11 November')
    ap.add_argument('--variant', required=True, help='the paper\'s variant digit (0500_s24_qp_12 → 2)')
    ap.add_argument('--syllabus', default='0500', choices=['0500', '0990'])
    ap.add_argument('--ins', required=True)
    ap.add_argument('--qp', required=True)
    ap.add_argument('--ms', default=None)
    ap.add_argument('--out', required=True)
    a = ap.parse_args()

    yyyy, mm = a.sitting[:4], a.sitting[4:6]
    if mm not in SERIES:
        raise Refuse(f'--sitting month {mm} is not a Cambridge series (03/06/11)')
    paper = int(a.paper)
    topic_number = int(f'{yyyy}{mm}{a.variant}')
    sitting_label = f'{SERIES[mm]} {yyyy} (variant {a.variant})'
    letters = ['A', 'B', 'C'] if paper == 1 else ['A', 'B']
    sources = parse_insert(a.ins, letters, optional=['B'] if paper == 2 else [])
    letters = [L for L in letters if L in sources]
    qs = parse_qp_p1(a.qp) if paper == 1 else parse_qp_p2(a.qp)
    needs_human, notes = [], []

    if paper == 1:
        for L in letters:
            if not sources[L]['title']:
                needs_human.append(f'Text {L} has no printed title on the insert')
        titles = ' / '.join(sources[L]['title'] for L in letters)
        label = f'Cambridge IGCSE {a.syllabus} Paper 1 — {sitting_label} · {titles}'
        form = q3_form(qs['Q3']['text'])
        form_line = f" This paper's form is the {form}." if form else ''
        teaching = (f'Cambridge IGCSE First Language English Paper 1 — Reading, {sitting_label}. A real '
                    f'Cambridge past paper. THREE texts, 80 marks, 2 hours. Q1 [30] = short-answer '
                    f'comprehension on Text A plus a summary of Text B (120 words maximum, 10 reading + '
                    f'5 writing). Q2 [25] = short language items on Text C plus the Writer’s Effect '
                    f'analysis [15], 200–300 words. Q3 [25] = extended response in role from Text C, '
                    f'250–350 words, 15 reading + 10 writing.{form_line}')
    else:
        for L in letters:
            notes.append(f'Text {L} is printed with no title and no author on the Paper 2 insert '
                         f'(Cambridge heads it simply "Text {L}") — its printed description is the Context line')
        form = sec_a_form(qs['Q1']['text'])
        if not form:
            needs_human.append('Section A form not read from "Base your <form> on what you have read in both texts"')
        label = (f'Cambridge IGCSE {a.syllabus} Paper 2 — {sitting_label} · Directed Writing'
                 + (f' ({form})' if form else '') + ' · Composition')
        teaching = (f'Cambridge IGCSE First Language English Paper 2 — Directed Writing and Composition, '
                    f'{sitting_label}. A real Cambridge past paper. Section A Question 1 [40] = directed '
                    f'writing, 250–350 words, 15 reading + 25 writing'
                    + (f'; this paper’s form is the {form}' if form else '') + '. The 15 reading marks '
                    f'are earned by EVALUATING the ideas in ' + ('both texts' if len(letters) > 1 else 'the text') + ', not by reproducing them. Section B '
                    f'[40] = one composition from four, 350–450 words, 16 content and structure + '
                    f'24 style and accuracy.')

    cites, cite_fails = check_citations(qs, sources)
    for k in cite_fails:
        needs_human.append(f'paragraph citation unresolved: {k} ({cites[k]})')
    for k, v in cites.items():
        m = re.match(r'^ok \(Text ([ABC]), paragraph (\d+) here\)$', v)
        cited = re.search(r'paragraph (\d+)', k)
        if m and cited and m.group(2) != cited.group(1):
            notes.append(f'{k}: Cambridge does not count Text {m.group(1)}\u2019s date or sub-heading lines, '
                         f'so its paragraph {cited.group(1)} is the {m.group(2)}th block of the text in this document')

    total = sum(q['marks'] for q in qs.values())
    if total != 80:
        raise Refuse(f'qp: tariff sums to {total}, not 80')

    aos = P1_AOS if paper == 1 else P2_AOS
    md = [f'# Topic {topic_number}: {label}',
          '**Type:** language_paper',
          '**Format:** multi_question',
          f'**Teaching Point:** {teaching}',
          '**Marks:** 80',
          '**AOs:** AO1, AO2, AO3',
          '']
    for L in letters:
        src = sources[L]
        md.append(f'## Text {L}')
        if src['title']:
            md.append(f'**Title:** {src["title"]}')
        md.append('**Author:** Unknown')
        if src['context']:
            md.append(f'**Context:** {src["context"]}')
        else:
            notes.append(f'Text {L} carries no introductory line on the insert — Cambridge prints the text straight under the heading')
        md.append('')
        for n, txt in src['body']:
            md.append(txt if n is None else f'{n:<3}{txt}')
        for note in src['footnotes']:
            md.append('')
            md.append(note)
        md.append('')
    for qid in sorted(qs):
        md.append(f'## {qid}')
        md.append(f'**Marks:** {qs[qid]["marks"]}')
        md.append(f'**AOs:** {aos[qid]}')
        md.append('')
        md.append(qs[qid]['text'])
        md.append('')
    md.append('---')

    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    open(a.out, 'w', encoding='utf-8').write('\n'.join(md) + '\n')

    text_slug = f'cambridge_igcse_lang_paper_{paper}'
    side = {
        'topic_number': topic_number,
        'board': 'cambridge-igcse',
        'text': text_slug,
        'store': f'swml_topics_cambridge-igcse_{text_slug}',
        'label': label,
        'sources': {L: {'title': sources[L]['title'] or None, 'untitled': not sources[L]['title'],
                        'line_count': sources[L]['count'], 'line_checks': sources[L]['checks']} for L in letters},
        'questions': {qid: qs[qid]['marks'] for qid in sorted(qs)},
        # Cambridge never sets the AQA Paper 2 true/false statement question — Paper 1 Q1 is lettered
        # sub-parts plus a summary, Paper 2 Q1 is the directed-writing task (gate reads this key)
        'q1_format': 'sub_parts' if paper == 1 else 'open',
        'total_marks': total,
        'provenance': {'syllabus': a.syllabus, 'ins': os.path.basename(a.ins), 'ins_sha1': sha1(a.ins),
                       'qp': os.path.basename(a.qp), 'qp_sha1': sha1(a.qp),
                       'ms': os.path.basename(a.ms) if a.ms else None},
        'part_marks': {qid: qs[qid]['part_marks'] for qid in sorted(qs)},
        'paragraph_checks': cites,
        'page_breaks': {L: sources[L]['page_breaks'] for L in letters},
        'readings': {L: sources[L]['reading'] for L in letters},
        'needs_human': needs_human,
        'notes': notes,
    }
    if paper == 2:
        side['section_b_options'] = qs['Q2']['options']
    open(re.sub(r'\.md$', '', a.out) + '.checks.json', 'w', encoding='utf-8').write(
        json.dumps(side, indent=2, ensure_ascii=False) + '\n')

    print(f'✓ {a.out}')
    print(f'  {label}')
    print('  ' + '  '.join(f'Text {L}: {sources[L]["count"]} lines, {len(sources[L]["checks"])} markers'
                           for L in letters) + f'  tariff={side["questions"]}')
    if cites:
        print(f'  paragraph citations: {sum(1 for v in cites.values() if v.startswith("ok"))}/{len(cites)} resolved')
    if needs_human:
        print('  NEEDS HUMAN: ' + ' | '.join(needs_human))


if __name__ == '__main__':
    try:
        main()
    except Refuse as e:
        print(f'✗ REFUSED: {e}', file=sys.stderr)
        sys.exit(2)
