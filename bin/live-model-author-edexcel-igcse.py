#!/usr/bin/env python3
"""
live-model-author-edexcel-igcse.py — author a LIVE MODELLING past-paper topic for Edexcel
International GCSE English Language SPECIFICATION A (4EA1) from the board's OWN PDFs.

Sibling of bin/live-model-author-paper.py (AQA). Same contract, same refusals:

  * the plugin's topic-template markdown is the ONLY output grammar (SWML_Topic_Parser parses it);
  * a `.checks.json` sidecar carries topic_number / board / text / store / label / sources /
    questions / total_marks / provenance(sha1) / needs_human / notes;
  * every printed line marker must land on the board's own words — otherwise the tool REFUSES;
  * anything the PDF cannot give is written as "[NEEDS HUMAN: …]" and listed in the sidecar.
    Nothing is guessed, nothing is paraphrased.

    live-model-author-edexcel-igcse.py --paper 1 --sitting 202406 \
        --qp "June 2024 QP.pdf" [--ms "…MS.pdf"] \
        --out bin/live-modelling-papers/edexcel-igcse/edexcel_igcse_lang_a/202406.md

    live-model-author-edexcel-igcse.py --paper 2 --sitting 202301 --variant R \
        --qp "January 2023 (R) QP.pdf" --image "Image 1: …" --image "Image 2: …" \
        --out …/edexcel_igcse_lang_a_paper_2/2023011.md

────────────────────────────────────────────────────────────────────────────────────────────────
ONE DELIBERATE DEVIATION FROM THE AQA TOOL, and it is forced (root CLAUDE.md §13 — state it):
the AQA tool reads `pdftotext -layout`; this one reads `pdftotext -bbox-layout`. Edexcel's
typesetting makes -layout lossy in three ways that -bbox-layout measures exactly:

  1. PARAGRAPHS. On several Edexcel extracts -layout emits NO blank line between paragraphs
     (June 2020 P2 "Significant Cigarettes" is 45 unbroken lines), so paragraphing — which AO2
     structure work depends on — is simply gone. In -bbox-layout the signal is a number:
     within-paragraph leading is 14.0pt, a paragraph break is 24.0pt+.
  2. LINE MARKERS. Edexcel prints them in the RIGHT margin (x≈547) rather than AQA's left, where
     -layout leaves them glued to the end of the sentence and indistinguishable from real text.
  3. FOOTNOTE SUPERSCRIPTS. -layout renders them as "halyards1"; -bbox-layout gives the marker as
     its own word with a measurably smaller glyph height (8.4pt against the body's 14.4pt), so it
     can be rendered as the superscript the board actually prints ("halyards¹").

Word joining is measured too: pdftotext's word boundaries ARE the printed spaces, so words join
with a space — except across a footnote superscript, where the font run breaks mid-word and the
pieces sit under a point apart, so "hypothermia⁴." comes back as the board set it.

The furniture filter is checked from both ends: page furniture is dropped on the way IN, and every
emitted line is asserted clean on the way OUT — a filter is a pattern, and the rotated "DO NOT
WRITE IN THIS AREA" strip prints two of its three repetitions with no space between them.

WHAT THE PAPERS ARE (verified, not assumed — see PROVENANCE at the foot of this file):
  Paper 1 (4EA1/01) 2h15, 90 marks. Section A Reading 45: Q1 AO1 · Q2 AO1 · Q3 AO1 · Q4 AO2 ·
      Q5 AO3, over Text One (unseen non-fiction, printed in the Source Booklet) and Text Two
      (a Part-1 anthology non-fiction text, reprinted in the same Source Booklet).
      Section B Transactional Writing 45: ONE task from a choice of two (the paper's Q6/Q7).
  Paper 2 (4EA1/02) 1h30, 60 marks. Section A Reading 30: one essay (AO1 12 + AO2 18) on a
      Part-2 anthology poem (printed in the paper) or prose text (printed in the Extract/Source
      Booklet bound into the same PDF). Section B Imaginative Writing 30: ONE task from a choice
      of three (the paper's Q2/Q3/Q4), AO4 18 + AO5 12.

  The board's choose-one section is emitted as ONE question — Q6 (Paper 1) / Q2 (Paper 2) — with
  the board's own question numbers kept as the option labels inside it. That is what
  protocols/shared/language-paper-specs.json → edexcel-igcse already declares, and it is the only
  shape whose tariff sums to the paper's printed total.
"""
import argparse, collections, hashlib, html, json, os, re, subprocess, sys

PDFTOTEXT = '/opt/homebrew/bin/pdftotext'
PDFTOPPM  = '/opt/homebrew/bin/pdftoppm'
SITTING_WORDS = {'01': 'January', '06': 'June'}
SUP = {'0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'}

# The tariff and AO map are the board's, read from the paper and cross-checked against the
# specification's own "Breakdown of assessment objectives and raw marks" table and the mark
# schemes. They are ASSERTED against each paper, never substituted for it.
P1_AOS   = {'Q1': 'AO1', 'Q2': 'AO1', 'Q3': 'AO1', 'Q4': 'AO2', 'Q5': 'AO3', 'Q6': 'AO4, AO5'}
P1_MARKS = {'Q1': 2, 'Q2': 4, 'Q3': 5, 'Q4': 12, 'Q5': 22, 'Q6': 45}
P2_AOS   = {'Q1': 'AO1, AO2', 'Q2': 'AO4, AO5'}
P2_MARKS = {'Q1': 30, 'Q2': 30}
P1_SPLIT = {'Q6': 'AO4 27 + AO5 18'}
P2_SPLIT = {'Q1': 'AO1 12 + AO2 18', 'Q2': 'AO4 18 + AO5 12'}

# Page furniture, split by how it is printed. Anything that is a WHOLE printed line is matched as
# a whole line — a prefix match here would eat the board's own words, and did: "Pearson Edexcel"
# as a prefix swallowed the middle of "…taken from the Pearson Edexcel International GCSE English
# Anthology, which is provided in the Extract Booklet."
FURNITURE_LINE = re.compile(
    r'^\s*(PMT|Turn over\s*►?|BLANK PAGE|(?:DO NOT WRITE IN THIS AREA\s*)+|'
    r'\*?P\d{5,6}[A-Z]\d*\*?|Instructions|Information|Advice|Total Marks|Centre Number|'
    r'Candidate Number|Other names|Candidate surname|Candidate signature|'
    r'Pearson Edexcel(\s+International GCSE)?(\s*\(9\s*[–-]\s*1\))?|Acknowledgements|'
    r'TOTAL FOR (SECTION [AB]|PAPER) = \d+ MARKS|Begin your answer on page \d+\.?|'
    r'Chosen question number:?|You do not need any other materials\.?)\s*$', re.I)
FURNITURE_PREFIX = re.compile(
    r'^\s*(Please check the examination details|Do not return this|©\d{4} Pearson|'
    r'Every effort has been made|Pearson Education Ltd|Indicate which question you are answering|'
    r'mind, put a line through the box|If you change your mind|Only one image should be chosen|'
    r'Answer the questions in the spaces provided|Source informations?:)\b', re.I)


def is_furniture(t):
    return bool(FURNITURE_LINE.match(t) or FURNITURE_PREFIX.match(t))


# The input filter is a pattern, and a pattern can be wrong — the rotated "DO NOT WRITE IN THIS
# AREA" strip is printed with no space between two of its three repetitions, which one version of
# the filter above did not match, and it reached both a poem and a question before this assertion
# existed. So the OUTPUT is checked too, against what the strip actually looks like on the page.
LEAKED = re.compile(r'DO NOT WRITE|^\s*PMT\s*$|^\s*Turn over|^\s*BLANK PAGE|\bP\d{5,6}[A-Z]\d*\b|'
                    r'^\s*\*P\d', re.I)


def assert_no_furniture(where, texts):
    for t in texts:
        if LEAKED.search(t):
            raise SystemExit(f'{where}: page furniture reached the output — {t.strip()[:80]!r}. '
                             f'Refusing; the furniture filter needs the missing form, not a paper '
                             f'authored around it.')


def is_dot_leader(t):
    """An answer line: mostly dot leaders, whatever number the layout glued to its front."""
    body = re.sub(r'^\s*\d{1,2}\s*', '', t)
    return len(body) > 10 and sum(c in '. ·…' for c in body) / len(body) > 0.6


# ─────────────────────────────────────────────── PDF → measured segments ──────────────────────
def sha1(path):
    h = hashlib.sha1()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 16), b''):
            h.update(chunk)
    return h.hexdigest()


def pdf_segments(path):
    """Every printed line of the PDF as a measured segment.

    Returns [{page, y, x0, x1, h, text}] in reading order (page, then y, then x). A "segment" is
    one <line> of `pdftotext -bbox-layout`; Edexcel's right-margin line markers and the footnote
    superscripts come back as their own segments, which is exactly what lets us tell them from
    the board's prose instead of guessing.
    """
    out = subprocess.run([PDFTOTEXT, '-bbox-layout', path, '-'],
                         check=True, capture_output=True, text=True).stdout
    segs, page_no = [], 0
    for chunk in re.split(r'(?=<page\b)', out):
        if not chunk.startswith('<page'):
            continue
        page_no += 1
        for m in re.finditer(r'<line xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</line>',
                             chunk, re.S):
            words = [(float(w.group(1)), float(w.group(2)), float(w.group(3)), float(w.group(4)),
                      html.unescape(w.group(5)))
                     for w in re.finditer(
                         r'<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">(.*?)</word>',
                         m.group(5), re.S)]
            if not words:
                continue
            body_h = max(w[3] - w[1] for w in words)
            # pdftotext's <word> boundaries ARE the printed spaces, so words join with a space.
            # The one exception is a footnote superscript, which breaks the font run mid-word:
            # it attaches to what precedes it, and the punctuation that follows attaches to it,
            # both recognised by a horizontal gap of under a point ("hypothermia" + "4" + ".").
            text, prev_x1, after_sup = '', None, False
            for x0, y0, x1, y1, w in words:
                wh = y1 - y0
                if text and re.fullmatch(r'\d{1,2}', w) and wh < body_h * 0.75 and x0 - (prev_x1 or x0) <= 1.0:
                    text += ''.join(SUP.get(c, c) for c in w)     # printed superscript
                    prev_x1, after_sup = x1, True
                    continue
                if text and not (after_sup and prev_x1 is not None and x0 - prev_x1 <= 1.0):
                    text += ' '
                text += w
                prev_x1, after_sup = x1, False
            # control codes and private-use glyphs (the arrow dingbats in Edexcel's footers) are
            # not the board's words; drop them so they cannot become a numbered line
            text = re.sub(r'[\x00-\x1f\x7f\ue000-\uf8ff]', '', text)
            text = re.sub(r'[ \t]{2,}', ' ', text).strip()
            if not text:
                continue
            segs.append({'page': page_no, 'y': float(m.group(2)), 'x0': float(m.group(1)),
                         'x1': float(m.group(3)), 'h': float(m.group(4)) - float(m.group(2)),
                         'text': text})
    segs.sort(key=lambda s: (s['page'], round(s['y'], 1), s['x0']))
    # Edexcel sets a footnote's superscript marker as its own text run, a hair ABOVE and hard
    # against the gloss it belongs to ("¹" at x 70.9–73.1 on y 511.7, "halyards: …" from x 73.1 on
    # y 510.9) — so sorting by y alone puts them the wrong way round. Cluster everything that
    # shares a baseline (within 3pt), order that cluster by x, and rejoin only the pieces that
    # touch. The right-margin line markers sit ~29pt clear of the text and so are never swallowed.
    out, i = [], 0
    while i < len(segs):
        j = i + 1
        while j < len(segs) and segs[j]['page'] == segs[i]['page'] and abs(segs[j]['y'] - segs[i]['y']) <= 3.0:
            j += 1
        cluster = sorted(segs[i:j], key=lambda s: s['x0'])
        cur = dict(cluster[0])
        for nxt in cluster[1:]:
            if -2.0 <= nxt['x0'] - cur['x1'] <= 3.0:     # the superscript's box abuts (or laps) the gloss
                if re.fullmatch(r'\d{1,2}', cur['text']) and cur['h'] < nxt['h'] * 0.75:
                    cur['text'] = ''.join(SUP.get(c, c) for c in cur['text'])   # printed superscript
                cur['text'] = (cur['text'] + ' ' + nxt['text']).strip()
                cur['x1'] = max(cur['x1'], nxt['x1'])
                cur['h'] = max(cur['h'], nxt['h'])
            else:
                out.append(cur)
                cur = dict(nxt)
        out.append(cur)
        i = j
    out.sort(key=lambda s: (s['page'], round(s['y'], 1), s['x0']))
    return out


def find(segs, pattern, start=0, end=None, flags=re.I):
    rx = re.compile(pattern, flags)
    for i in range(start, len(segs) if end is None else end):
        if rx.search(segs[i]['text']):
            return i
    return None


def find_all(segs, pattern, start=0, end=None, flags=re.I):
    rx = re.compile(pattern, flags)
    return [i for i in range(start, len(segs) if end is None else end) if rx.search(segs[i]['text'])]


def clean_block(segs, lo, hi):
    """Drop page furniture and answer-line dot leaders from a slice."""
    return clean_block_idx(segs, range(lo, hi))


def clean_block_idx(segs, idxs):
    keep = []
    for s in (segs[k] for k in idxs):
        t = s['text']
        if is_furniture(t) or is_dot_leader(t):
            continue
        if re.fullmatch(r'[\d\s]{1,4}', t) and (s['y'] < 55 or s['y'] > 810):
            continue          # page number in the header/footer band (the line-marker column
                              # reaches y≈790, so the band must start below it)
        if re.fullmatch(r'[-\s]+', t):
            continue          # dingbat glyphs
        keep.append(s)
    return keep


# ─────────────────────────────────────────────── source text reconstruction ───────────────────
def reconstruct(block, label):
    """Turn a slice of measured segments into numbered body lines + printed-marker checks.

    Edexcel prints a marker every five lines in the right margin. The marker's baseline sits ~2pt
    below its line's, so it is matched to the nearest body line. The FIRST marker fixes where the
    body starts (marker 5 lands on body line 5), which is what separates the board's one-sentence
    introduction from the extract proper — and every later marker then has to agree, or we refuse.
    """
    markers, body = [], []
    marker_x = None
    digits = [s for s in block if re.fullmatch(r'\d{1,3}', s['text'])]
    if digits:
        right = [s for s in digits if s['x0'] > 400]
        if right:
            marker_x = min(s['x0'] for s in right) - 3
    for s in block:
        if marker_x is not None and s['x0'] >= marker_x and re.fullmatch(r'\d{1,3}', s['text']):
            markers.append(s)
        else:
            body.append(s)
    body = [b for b in body if b['text'].strip()]
    if not body:
        raise SystemExit(f'{label}: no body lines found — refusing')

    # leading (within-paragraph) and paragraph gap, measured on this block
    gaps = [round(b['y'] - a['y'], 1) for a, b in zip(body, body[1:]) if b['page'] == a['page'] and b['y'] > a['y']]
    lead = collections.Counter(gaps).most_common(1)[0][0] if gaps else 14.0   # the modal gap IS the leading
    max_x1 = max(s['x1'] for s in body)

    # line 1 of the extract: fixed by the first printed marker; without markers the whole block is body
    first = 0
    if markers:
        m0 = markers[0]
        idx = min(range(len(body)), key=lambda i: abs(body[i]['y'] + 1.8 - m0['y'])
                  if body[i]['page'] == m0['page'] else 1e9)
        k = int(m0['text'])
        first = idx - (k - 1)
        if first < 0:
            raise SystemExit(
                f'{label}: the board prints marker {k} beside line {idx + 1} of its own extract, so its '
                f'printed numbering runs {-first} line(s) ahead of the text it numbers (this paper appears '
                f'to count the extract heading as a line). REFUSING rather than renumbering the board — '
                f'author this sitting by hand if that shift is intended.')
        if first > 0:
            gap_in = body[first]['y'] - body[first - 1]['y'] if body[first]['page'] == body[first - 1]['page'] else 1e9
            if gap_in < lead * 1.4:
                raise SystemExit(f'{label}: cannot separate the introduction from line 1 — the gap above '
                                 f'{body[first]["text"][:40]!r} is {gap_in:.1f}pt, no larger than the leading '
                                 f'({lead:.1f}pt). Refusing rather than guessing.')
    intro = [s['text'] for s in body[:first]]

    lines, checks = [], {}
    n = 0
    for i, s in enumerate(body[first:]):
        prev = body[first + i - 1] if i else None
        if prev is not None:
            if s['page'] != prev['page']:
                # no vertical gap to read across a page break: a short last line ended a paragraph
                if prev['x1'] < max_x1 - 25:
                    lines.append((None, ''))
            elif s['y'] - prev['y'] > lead * 1.4:
                lines.append((None, ''))
        n += 1
        lines.append((n, s['text']))
    for m in markers:
        k = int(m['text'])
        cand = [(abs(b['y'] + 1.8 - m['y']), j) for j, b in enumerate(body[first:]) if b['page'] == m['page']]
        if not cand:
            raise SystemExit(f'{label}: printed marker {k} has no body line on its page — refusing')
        d, j = min(cand)
        if d > max(4.0, lead * 0.5):
            raise SystemExit(f'{label}: printed marker {k} sits {d:.1f}pt from any body line '
                             f'(leading {lead:.1f}pt) — refusing')
        if j + 1 != k:
            raise SystemExit(f'{label}: printed marker {k} landed on reconstructed line {j + 1} — refusing '
                             f'(text: {body[first + j]["text"][:50]!r})')
        checks[str(k)] = body[first + j]['text'][:32]
    if not checks:
        checks = {}
    return {'intro': ' '.join(intro), 'lines': lines, 'checks': checks, 'count': n,
            'paragraphs': sum(1 for n_, _ in lines if n_ is None) + 1}


def footnotes(block):
    """Footnote entries printed under an extract: a small superscript digit then the gloss."""
    out = []
    for s in block:
        m = re.match(r'^([¹²³⁴⁵⁶⁷⁸⁹])\s*(\S.*)$', s['text'])
        if m:
            out.append(f'{m.group(1)} {m.group(2)}')
    return out


NAME = re.compile(r"^[A-Z][\w’'\-]+(?:\s+(?:de|van|von|del|la|di|[A-Z][\w’'\-]+)){1,4}$", re.U)


def norm_title(t):
    """Compare titles across the board's own inconsistent quotes and dashes."""
    t = re.sub(r'[“”"\'‘’]', '', t or '')
    t = re.sub(r'[\u2010-\u2015\u2212-]+', '-', t)
    return re.sub(r'\s+', ' ', t).strip().lower().rstrip('-').strip()


def looks_like_a_name(t):
    """Is this line an author's name rather than prose, a heading or a line marker?"""
    t = t.strip()
    return bool(NAME.match(t)) and len(t) < 60 and not t.endswith('.')


ANTHOLOGY_MD = 'iGCSE-Anthology-English-Language-A-and-English-Literature.md'


def find_anthology(a):
    """The board's anthology markdown, alongside the papers unless --anthology names it."""
    if a.anthology:
        return a.anthology
    d = os.path.dirname(os.path.abspath(a.qp))
    for _ in range(4):
        hit = os.path.join(d, 'Anthology for Edexcel IGCSE Spec A', ANTHOLOGY_MD)
        if os.path.isfile(hit):
            return hit
        d = os.path.dirname(d)
    return None


def anthology_pairs(md_path):
    """Every Part-2 (Paper 2) anthology text and its author, read from the board's own anthology.

    Used only to CHECK the name printed under the extract in the question paper — two independent
    sources, so agreement means something (a check that reads the same file it is checking is not
    a check at all).
    """
    if not md_path or not os.path.isfile(md_path):
        return {}
    lines = open(md_path, encoding='utf-8', errors='replace').read().split('\n')
    def body_heading(needle):          # the contents list repeats these; want the section itself
        hits = [i for i, l in enumerate(lines) if l.startswith('#') and needle in l]
        return hits[-1] if hits else None
    lo, hi = body_heading('Part 2: Paper 2 Section A'), body_heading('Part 3: Paper 1 Section A')
    if lo is None or hi is None or hi <= lo:
        return {}
    heads = [(i, re.sub(r'[*#]', '', l).strip()) for i, l in enumerate(lines[lo:hi], lo)
             if re.match(r'^(?:##\s*)?\*\*.+\*\*\s*(?:\{[^}]*\})?\s*$', l)]
    pairs, pending = {}, None
    for i, txt in heads:
        txt = re.sub(r'\s*\{[^}]*\}\s*$', '', txt).strip()
        if pending and looks_like_a_name(txt):
            pairs[norm_title(pending)] = txt
            pending = None
        elif txt and pending is None and not looks_like_a_name(txt):
            pending = txt
    return pairs


# ─────────────────────────────────────────────── question reconstruction ──────────────────────
def as_paragraphs(kept):
    """Measured segments → the board's paragraphs and bullets.

    A printed block ends where the page says it ends: the next line drops back to a smaller left
    margin, or steps in by a real indent, or sits more than one line's leading below. A wrapped
    line that merely tucks under its question number (a 4-5pt step) is NOT a new block, which is
    why the indent threshold is 20pt and not 5.
    """
    # The leading IS the line height for this typesetting, so measure it rather than infer it from
    # the gaps: on a page of instructions every line is blank-line separated, and a modal gap would
    # then report 24pt and refuse to break anything.
    hs = sorted(x['h'] for x in kept)
    lead = hs[len(hs) // 2] if hs else 14.0
    paras, cur = [], []
    for i, s in enumerate(kept):
        t = s['text']
        if re.match(r'^[•·]\s*', t):
            if cur:
                paras.append(' '.join(cur)); cur = []
            paras.append('- ' + re.sub(r'^[•·]\s*', '', t).strip())
            continue
        if paras and paras[-1].startswith('- ') and not cur and i and s['x0'] > kept[i - 1]['x0'] + 5:
            paras[-1] += ' ' + t
            continue
        cur.append(t)
        nxt = kept[i + 1] if i + 1 < len(kept) else None
        if nxt is not None:
            dx = nxt['x0'] - s['x0']
            dy = (nxt['y'] - s['y']) if nxt['page'] == s['page'] else 0
            if dx < -5 or dx > 20 or dy > lead * 1.4:
                paras.append(' '.join(cur)); cur = []
    if cur:
        paras.append(' '.join(cur))
    return [re.sub(r'^-\s+', '- ', p.strip()) for p in paras if p.strip() and p.strip() != '-']


def scan_questions(segs, first_q, last_q, section_start, exclude=None):
    """Read the board's questions in order, anchored on its own printed tariff lines.

    "(Total for Question N = M marks)" is unambiguous and appears once per question, so it — not a
    guess about which "2" at the left margin is a question cell rather than an answer slot — fixes
    every boundary. Whatever the board prints between one tariff line and the next question's cell
    is that question's preamble ("Remind yourself of the extract from …") and is kept verbatim.
    """
    totals, prev = {}, section_start
    for n in range(first_q, last_q + 1):
        i = find(segs, r'\(Total for Question\s+' + str(n) + r'\s*=\s*\d+\s*marks?\)', prev)
        if i is None:
            raise SystemExit(f'qp: no "(Total for Question {n} = N marks)" line after question {n - 1} — refusing')
        totals[n], prev = i, i + 1
    out, prev_end = {}, section_start
    for n in range(first_q, last_q + 1):
        cand = [j for j in range(prev_end, totals[n])
                if segs[j]['x0'] < 90 and re.match(r'^' + str(n) + r'\s+\S', segs[j]['text'])
                and not is_dot_leader(segs[j]['text'])]
        if not cand:
            raise SystemExit(f'qp: question {n} cell not found before its tariff line — refusing')
        cell = cand[0]
        lo_pre = prev_end + (1 if prev_end > section_start else 0)
        idxs = [k for k in range(lo_pre, cell) if not (exclude and exclude[0] <= k <= exclude[1])]
        pre = as_paragraphs([x for x in clean_block_idx(segs, idxs)
                             if not re.fullmatch(r'(EITHER|OR|SECTION [AB]|READING|Reading|'
                                                 r'TRANSACTIONAL WRITING|Transactional Writing|'
                                                 r'Imaginative Writing|IMAGINATIVE WRITING|'
                                                 r'SECTION [AB]: ?(?:Reading|READING|Imaginative Writing|'
                                                 r'Transactional Writing))', x['text'])])
        kept = []
        for s2 in clean_block(segs, cell, totals[n]):
            t = s2['text']
            if re.fullmatch(r'\(\d+\)', t) or re.fullmatch(r'[A-Z]?\d{0,3}', t):
                continue                      # the running mark box and the answer-slot numbers
            kept.append(s2)
        paras = as_paragraphs(kept)
        if paras:
            paras[0] = re.sub(r'^' + str(n) + r'\s+', '', paras[0])
        marks = int(re.search(r'=\s*(\d+)\s*marks?', segs[totals[n]]['text'], re.I).group(1))
        out[n] = {'text': '\n\n'.join(paras).strip(), 'preamble': '\n\n'.join(pre).strip(), 'marks': marks}
        prev_end = totals[n]
    return out


def paper_header(segs, want_code):
    """Verify the paper reference and read the printed exam date."""
    head = ' '.join(s['text'] for s in segs[:60])
    if want_code not in head.replace(' ', ''):
        raise SystemExit(f'qp: paper reference {want_code} not on the front page — refusing')
    dm = re.search(r'((?:Monday|Tuesday|Wednesday|Thursday|Friday)\s+\d{1,2}\s+\w+\s+20\d\d)', head)
    return dm.group(1) if dm else None


# ─────────────────────────────────────────────── PAPER 1 (4EA1/01) ────────────────────────────
def author_p1(a, segs):
    needs_human, notes = [], []
    exam_date = paper_header(segs, '4EA1/01')

    # ── Source Booklet (bound into the same PDF for every sitting we hold) ──
    sb = find(segs, r'^Read the following extracts? carefully and then answer Section A')
    if sb is None:
        raise SystemExit('qp: no Source Booklet inside this PDF (no "Read the following extracts carefully" '
                         'page). Supply the booklet or author this sitting by hand — refusing.')
    t1 = find(segs, r'^Text One:\s*\S', sb)
    t2 = find(segs, r'^Text Two:\s*\S', sb)
    if t1 is None or t2 is None:
        raise SystemExit('qp: the Source Booklet has no "Text One:"/"Text Two:" headings — refusing')
    ack = find(segs, r'^Text One adapted from|^Text One (?:is )?from|^Sources?:', t2)
    end = ack if ack is not None else len(segs)

    titles = {'A': re.sub(r'^Text One:\s*', '', segs[t1]['text']).strip(),
              'B': re.sub(r'^Text Two:\s*', '', segs[t2]['text']).strip()}
    blocks = {'A': clean_block(segs, t1 + 1, t2), 'B': clean_block(segs, t2 + 1, end)}

    # split each block: extract body (up to the footnote gloss) then the footnotes
    sources = {}
    for L in ('A', 'B'):
        blk = blocks[L]
        fn_at = next((i for i, s in enumerate(blk) if re.match(r'^[¹²³⁴⁵⁶⁷⁸⁹]\s*\S', s['text'])), len(blk))
        rec = reconstruct(blk[:fn_at], f'Text {"One" if L == "A" else "Two"}')
        rec['footnotes'] = footnotes(blk[fn_at:])
        rec['title'] = titles[L]
        sources[L] = rec

    # authors: the board's own acknowledgements page, cross-checked against the intro sentence
    authors, works = {}, {}
    if ack is not None:
        acktext = ' '.join(s['text'] for s in segs[ack:ack + 12])
        for L, word in (('A', 'One'), ('B', 'Two')):
            m = re.search(r'Text ' + word + r'[^.]*?adapted from\s+(.+?)(?=\s*(?:Text (?:One|Two)|Images? (?:One|Two|\d)|Every effort|Acknowledge)\b|$)', acktext)
            if not m:
                continue
            cred = re.split(r',?\s*(?:copyright ©|Copyright ©|Reproduced by permission|Every effort|Images? (?:One|Two)\b)',
                            m.group(1))[0]
            cred = re.sub(r'\s*P\d{5,6}[A-Z].*$', '', cred).strip().rstrip(',.')
            works[L] = cred
            am = re.search(r'\bby\s+([A-Z][\w’\'\-]+(?:\s+[A-Z][\w’\'\-]+)+)', cred) \
                or re.search(r'^(?:From\s+)?[^,]+,\s*([A-Z][\w’\'\-]+(?:\s+[A-Z][\w’\'\-]+)+)', cred)
            if am:
                authors[L] = am.group(1).strip()
    for L in ('A', 'B'):
        if L not in authors:
            im = re.search(r'the writers?,\s+([A-Z][\w’\'\-]+(?:\s+[A-Z][\w’\'\-]+)+)', sources[L]['intro'])
            if im:
                authors[L] = im.group(1).strip()
        if L not in authors:
            needs_human.append(f'Text {"One" if L == "A" else "Two"} author not printed in the paper')
            authors[L] = '[NEEDS HUMAN: author not printed in the paper]'

    # ── questions ──
    sec_a = find(segs, r'^SECTION A\b') or 0
    qs = scan_questions(segs, 1, 7, sec_a)
    if qs[6]['marks'] != qs[7]['marks']:
        raise SystemExit(f'qp: Section B options carry {qs[6]["marks"]} and {qs[7]["marks"]} marks — refusing')

    def joined(n):
        pre = qs[n]['preamble']
        return (pre + '\n\n' if pre else '') + qs[n]['text']

    b_pre = qs[6]['preamble']
    if 'Answer ONE' not in b_pre:
        b_pre = ('Answer ONE question in this section.\n\n' + b_pre).strip()
    section_b = b_pre + '\n\n**Question 6:** ' + qs[6]['text'] + '\n\n**Question 7:** ' + joined(7)
    out_qs = {f'Q{n}': {'text': joined(n), 'marks': qs[n]['marks']} for n in range(1, 6)}
    out_qs['Q6'] = {'text': section_b, 'marks': qs[6]['marks']}
    total = sum(q['marks'] for q in out_qs.values())
    if total != 90:
        raise SystemExit(f'qp: tariff sums to {total}, not the printed 90 — refusing')
    for qid, want in P1_MARKS.items():
        if out_qs[qid]['marks'] != want:
            raise SystemExit(f'qp: {qid} carries {out_qs[qid]["marks"]} marks, the specification says {want} — refusing')
    notes.append('Section B is emitted as one 45-mark question (Q6) carrying the board\'s own Q6 and Q7 as its '
                 'two options — the paper is answered once, and this is the shape '
                 'protocols/shared/language-paper-specs.json declares for edexcel-igcse language_p1.')
    return {'sources': sources, 'titles': titles, 'authors': authors, 'works': works,
            'questions': out_qs, 'total': total, 'exam_date': exam_date,
            'needs_human': needs_human, 'notes': notes}


# ─────────────────────────────────────────────── PAPER 2 (4EA1/02) ────────────────────────────
def author_p2(a, segs):
    needs_human, notes = [], []
    exam_date = paper_header(segs, '4EA1/02')

    sec_a = find(segs, r'^SECTION A\b')          # "SECTION A" or the older "SECTION A: Reading"
    if sec_a is None:
        raise SystemExit('qp: no "SECTION A" heading — refusing')
    remind = find(segs, r'^Remind yourself of\b', sec_a)
    if remind is None:
        raise SystemExit('qp: no "Remind yourself of …" line — refusing')
    remind_text = segs[remind]['text']
    remind_end = remind
    j = remind + 1
    while j < len(segs) and not re.search(r'Anthology', remind_text, re.I) and j < remind + 4:
        remind_text += ' ' + segs[j]['text']; remind_end = j; j += 1
    tm = re.match(r'^Remind yourself of\s+(.+?),?\s+taken from the Pearson Edexcel', remind_text)
    if not tm:
        raise SystemExit(f'qp: cannot read the anthology text title from {remind_text[:90]!r} — refusing')
    title = tm.group(1).strip().strip('“”"\'‘’')

    q1_at = next((i for i in find_all(segs, r'^1\s+(?:How|In what ways|Explore|Explain)\b', sec_a)
                  if segs[i]['x0'] < 90), None)
    if q1_at is None:
        raise SystemExit('qp: question 1 cell not found — refusing')

    booklet = find(segs, r'^Read the following extracts? carefully and then answer Section A', q1_at)
    if booklet is not None:                       # prose text, in the bound Extract/Source Booklet
        lo = booklet + 1
        hi = find(segs, r'^BLANK PAGE$|^Acknowledgements', lo) or len(segs)
        kind = 'prose'
    else:                                          # poem, printed inline in Section A
        lo = remind_end + 1
        hi = q1_at
        kind = 'poem'
    block = clean_block(segs, lo, hi)
    # the printed heading repeats the title; drop it and everything above it
    head_at = next((i for i, s in enumerate(block)
                    if s['text'].strip('“”"\'‘’').rstrip('.').lower().startswith(title.lower()[:24])), None)
    if head_at is None:
        raise SystemExit(f'qp: the extract heading for {title!r} is not printed in the '
                         f'{"booklet" if kind == "prose" else "paper"} — refusing')
    block = block[head_at + 1:]
    # The board prints the author's name under the extract — sometimes flush left (June 2020 R),
    # sometimes set right (January 2023). It is the LAST line that reads as a name; a right-margin
    # line marker is not one, which is what a "last right-set short line" rule would have grabbed.
    att, att_i = None, None
    for i in range(len(block) - 1, -1, -1):
        if looks_like_a_name(block[i]['text']):
            att, att_i = block[i]['text'].strip(), i
            break
    if att is None:
        needs_human.append(f'author/poet of {title!r} not printed under the extract')
        att = '[NEEDS HUMAN: author not printed under the extract]'
    else:
        block = block[:att_i]
    # cross-check the printed name against the board's OWN anthology — two independent documents
    pairs = anthology_pairs(find_anthology(a))
    known = pairs.get(norm_title(title))
    if known and att and known.lower() != att.lower():
        needs_human.append(f'the paper prints “{att}” under {title!r} but the anthology lists '
                           f'“{known}” — resolve before installing')
    elif known:
        notes.append(f'Author confirmed against the board\'s own anthology ({known}).')
    elif not pairs:
        notes.append('The anthology markdown was not found, so the printed author was not cross-checked.')
    else:
        notes.append(f'{title!r} is not listed under that exact title in the anthology markdown, so the '
                     f'author is the name the question paper itself prints under the extract.')
    rec = reconstruct(block, title)
    rec['title'] = title
    rec['footnotes'] = []
    if not rec['checks']:
        notes.append(f'The board prints no line markers on “{title}” — the line numbers in this topic are ours, '
                     f'one per printed line, so there is nothing of the board\'s to assert them against.')

    # ── questions ──
    # an inline poem sits between the "Remind yourself of …" line and question 1; keep it out of
    # the question preambles, or the whole poem is printed inside question 1 as well
    skip = (remind_end + 1, q1_at - 1) if kind == 'poem' else None
    qs = scan_questions(segs, 1, 4, sec_a, exclude=skip)
    if len({qs[2]['marks'], qs[3]['marks'], qs[4]['marks']}) != 1:
        raise SystemExit('qp: the three Section B options do not carry the same tariff — refusing')
    imgs = list(a.image or [])
    b_texts = []
    for qn in (2, 3, 4):
        pre = qs[qn]['preamble'] if qn > 2 else ''      # Q2's preamble heads the whole section
        t = (pre + '\n\n' if pre else '') + qs[qn]['text']
        if re.search(r'\bimages?\b', t, re.I):
            if imgs:
                t += '\n\n' + '\n\n'.join(f'[IMAGE — {d.strip()}]' for d in imgs)
            else:
                t += '\n\n[NEEDS HUMAN: the stimulus images are pictures in the PDF, not text]'
                needs_human.append(f'Q{qn} stimulus images not described')
        b_texts.append(f'**Question {qn}:** ' + t)
    b_pre = qs[2]['preamble']
    if 'Answer ONE' not in b_pre:
        b_pre = ('Answer ONE question in this section.\n\n' + b_pre).strip()
    section_b = b_pre + '\n\n' + '\n\n'.join(b_texts)
    q1_pre = qs[1]['preamble']
    out_qs = {'Q1': {'text': ((q1_pre + '\n\n') if q1_pre else '') + qs[1]['text'], 'marks': qs[1]['marks']},
              'Q2': {'text': section_b, 'marks': qs[2]['marks']}}
    total = sum(q['marks'] for q in out_qs.values())
    if total != 60:
        raise SystemExit(f'qp: tariff sums to {total}, not the printed 60 — refusing')
    for qid, want in P2_MARKS.items():
        if out_qs[qid]['marks'] != want:
            raise SystemExit(f'qp: {qid} carries {out_qs[qid]["marks"]} marks, the specification says {want} — refusing')
    notes.append('Section B is emitted as one 30-mark question (Q2) carrying the board\'s own Q2, Q3 and Q4 as its '
                 'three options — the paper is answered once, and this is the shape '
                 'protocols/shared/language-paper-specs.json declares for edexcel-igcse language_p2.')
    return {'sources': {'A': rec}, 'titles': {'A': title}, 'authors': {'A': att}, 'works': {},
            'kind': kind, 'remind': remind_text, 'questions': out_qs, 'total': total,
            'exam_date': exam_date, 'needs_human': needs_human, 'notes': notes}


# ─────────────────────────────────────────────── EMIT ─────────────────────────────────────────
def render_source(md, heading, rec, author, context):
    md.append(f'## {heading}')
    md.append(f'**Title:** {rec["title"]}')
    md.append(f'**Author:** {author}')
    md.append(f'**Context:** {context}')
    md.append('')
    # the number column is 3 wide as in every other topic file, but an extract that runs past 99
    # lines needs 4 — otherwise "100" runs straight into the text and the line stops being a
    # numbered line at all (caught by the gate on the four long Paper 2 prose extracts)
    w = 4 if rec['count'] >= 100 else 3
    for n, txt in rec['lines']:
        md.append('' if n is None else f'{n:<{w}}{txt}')
    if rec.get('footnotes'):
        md.append('')
        md.append('**Glossary:**')
        for f in rec['footnotes']:
            md.append(f'- {f}')
    md.append('')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--paper', required=True, choices=['1', '2'])
    ap.add_argument('--sitting', required=True, help='YYYYMM of the series, e.g. 202406')
    ap.add_argument('--variant', default='', help="'R' for the board's reserve paper — the topic number gets a trailing 1")
    ap.add_argument('--qp', required=True)
    ap.add_argument('--ms', default=None)
    ap.add_argument('--out', required=True)
    ap.add_argument('--anthology', default=None,
                    help="the board's anthology markdown (found beside the papers by default)")
    ap.add_argument('--image', action='append', help='one-line description of a Section B stimulus image (Paper 2), repeatable')
    ap.add_argument('--no-dump-images', action='store_true',
                    help="don't save the Section B stimulus page as a PNG beside the topic (Paper 2)")
    a = ap.parse_args()

    yyyy, mm = a.sitting[:4], a.sitting[4:6]
    if mm not in SITTING_WORDS:
        raise SystemExit(f'--sitting month {mm} is neither January (01) nor June (06) — refusing')
    is_r = a.variant.upper() == 'R'
    sitting_label = f'{SITTING_WORDS[mm]} {yyyy}' + (' (R)' if is_r else '')
    topic_number = int(a.sitting + ('1' if is_r else ''))

    segs = pdf_segments(a.qp)
    paper = int(a.paper)
    res = author_p1(a, segs) if paper == 1 else author_p2(a, segs)
    needs_human, notes = res['needs_human'], res['notes']

    if res['exam_date'] and yyyy not in res['exam_date']:
        raise SystemExit(f'qp: the paper is dated {res["exam_date"]}, which is not the {a.sitting} series — refusing')
    if res['exam_date']:
        notes.append(f'Sat {res["exam_date"]}.')

    text = 'edexcel_igcse_lang_a' if paper == 1 else 'edexcel_igcse_lang_a_paper_2'
    store = f'swml_topics_edexcel-igcse_{text}'

    def short(x):
        return re.sub(r'\s*\[NEEDS HUMAN.*', 'unattributed', x or '').strip() or 'unattributed'

    titles = ' / '.join(f'{res["titles"][L]} ({short(res["authors"][L])})' for L in sorted(res['sources']))
    label = f'Edexcel IGCSE Language A Paper {paper} — {sitting_label} · {titles}'

    md = [f'# Topic {topic_number}: {label}', '**Type:** language_paper', '**Format:** multi_question']
    if paper == 1:
        md.append('**Teaching Point:** Edexcel IGCSE Spec A Paper 1 — Non-Fiction Texts and Transactional Writing, '
                  f'{sitting_label} sitting. Section A: five reading questions across two non-fiction texts (Text One '
                  'unseen, Text Two from the anthology), 45 marks. Q1–Q3 test AO1 on Text One; Q4 analyses language '
                  'and structure in Text Two (AO2); Q5 compares both texts (AO3). Section B: one transactional '
                  'writing task chosen from two, 45 marks (AO4 27 + AO5 18). Total: 90 marks. 2 hours 15 minutes.')
        md.append('**Marks:** 90')
        md.append('**AOs:** AO1, AO2, AO3, AO4, AO5')
        md.append('')
        for L, heading in (('A', 'Text One (Unseen)'), ('B', 'Text Two (Anthology)')):
            rec = res['sources'][L]
            bits = [rec['intro']]
            if res['works'].get(L):
                bits.append('Printed in the Source Booklet, adapted from ' + res['works'][L].rstrip('.'))
            context = '. '.join(b.rstrip('.') for b in bits if b) + '.'
            render_source(md, heading, rec, res['authors'][L], context)
    else:
        md.append('**Teaching Point:** Edexcel IGCSE Spec A Paper 2 — Poetry and Prose Texts and Imaginative Writing, '
                  f'{sitting_label} sitting. Section A: one 30-mark essay on an anthology '
                  f'{"poem" if res["kind"] == "poem" else "prose text"} (AO1 12 + AO2 18). Section B: one 30-mark '
                  'imaginative writing task chosen from three (AO4 18 + AO5 12). Total: 60 marks. 1 hour 30 minutes.')
        md.append('**Marks:** 60')
        md.append('**AOs:** AO1, AO2, AO4, AO5')
        md.append('')
        rec = res['sources']['A']
        context = res['remind'].strip().rstrip('.') + '.'
        if rec['intro']:
            context += ' ' + rec['intro'].rstrip('.') + '.'
        render_source(md, 'Source A', rec, res['authors']['A'], context)

    AOS = P1_AOS if paper == 1 else P2_AOS
    SPLIT = P1_SPLIT if paper == 1 else P2_SPLIT
    for qid, q in res['questions'].items():
        md.append(f'## {qid}')
        md.append(f'**Marks:** {q["marks"]}' + (f' ({SPLIT[qid]})' if qid in SPLIT else ''))
        md.append(f'**AOs:** {AOS[qid]}')
        md.append('')
        md.append(q['text'])
        md.append('')
        md.append(f'[{q["marks"]} marks]')
        md.append('')
    md.append('---')

    assert_no_furniture(os.path.basename(a.out), md)

    os.makedirs(os.path.dirname(a.out), exist_ok=True)
    open(a.out, 'w', encoding='utf-8').write('\n'.join(md) + '\n')

    # The Section B stimulus is a pair of PHOTOGRAPHS. Save the board's own page as a PNG next to
    # the topic so the picture itself is on disk and not only a sentence about it (root §17b).
    image_png = None
    if paper == 2 and not a.no_dump_images:
        pg = next((s['page'] for s in segs if re.match(r'^You may choose ONE image', s['text'], re.I)), None)
        if pg:
            d = os.path.join(os.path.dirname(a.out), 'images')
            os.makedirs(d, exist_ok=True)
            stem = os.path.join(d, f'{topic_number}-section-b-images')
            subprocess.run([PDFTOPPM, '-png', '-r', '110', '-f', str(pg), '-l', str(pg), a.qp, stem], check=True)
            hit = [f for f in sorted(os.listdir(d)) if f.startswith(f'{topic_number}-section-b-images')]
            image_png = os.path.join('images', hit[0]) if hit else None

    side = {
        'topic_number': topic_number, 'board': 'edexcel-igcse', 'text': text, 'store': store, 'label': label,
        'sources': {L: {'line_count': res['sources'][L]['count'],
                        'line_checks': res['sources'][L]['checks']} for L in sorted(res['sources'])},
        'source_headings': {L: ('Text One (Unseen)' if L == 'A' else 'Text Two (Anthology)')
                            for L in sorted(res['sources'])} if paper == 1 else {'A': 'Source A'},
        'questions': {qid: q['marks'] for qid, q in res['questions'].items()},
        'total_marks': res['total'],
        # Q1 on both 4EA1 papers is an OPEN question — Paper 1 asks for two words or phrases from
        # the text, Paper 2 for a 30-mark essay. Neither has the eight true/false statements that
        # are AQA Language Paper 2's shape, and the shared gate reads this rather than inferring
        # "two sources therefore statements".
        'q1_format': 'open',
        'provenance': {'qp': os.path.basename(a.qp), 'qp_sha1': sha1(a.qp),
                       'ms': os.path.basename(a.ms) if a.ms else None,
                       'ms_sha1': sha1(a.ms) if a.ms else None,
                       'exam_date': res['exam_date'],
                       'paper_code': f'4EA1/0{paper}',
                       'section_b_image_page': image_png},
        'needs_human': needs_human,
        'notes': notes,
    }
    open(re.sub(r'\.md$', '', a.out) + '.checks.json', 'w', encoding='utf-8').write(
        json.dumps(side, indent=2, ensure_ascii=False) + '\n')

    print(f'✓ {a.out}')
    print(f'  {label}')
    print('  ' + '  '.join(f'{side["source_headings"][L]}: {side["sources"][L]["line_count"]} lines, '
                           f'{len(side["sources"][L]["line_checks"])} markers, '
                           f'{res["sources"][L]["paragraphs"]} paragraphs' for L in sorted(res['sources'])))
    print(f'  tariff={side["questions"]} total={res["total"]}')
    if image_png:
        print(f'  Section B stimulus page saved: {image_png}')
    if needs_human:
        print('  NEEDS HUMAN: ' + ' | '.join(needs_human))


if __name__ == '__main__':
    main()

# ── PROVENANCE ────────────────────────────────────────────────────────────────────────────────
# Specification: "International GCSE English Language A Specification issue 4.pdf" (Issue 4, May
#   2022) — §"Breakdown of assessment objectives and raw marks": Paper 1 AO1 11 · AO2 12 · AO3 22 ·
#   AO4 27 + AO5 18 = 90; Paper 2 Q1 AO1 12 + AO2 18 = 30, Q2 AO4 18 + AO5 12 = 30.
# Mark schemes: "Edexcel IGCSE Language Paper 1 Spec A June 2024 MS.pdf" (Q1–Q3 AO1, Q4 AO2,
#   Q5 AO3, Q6/Q7 AO4+AO5) and "…Language Paper 2/June 2023 MS.pdf" (Q1 AO1+AO2, Section B AO4+AO5).
# Papers: the per-sitting tariff is READ FROM EACH PAPER's own "(Total for Question N = M marks)"
#   lines and asserted against the table above — a totals check alone cannot tell 2+4+5 from
#   2+3+6 (root CLAUDE.md §PARALLEL LANES 2a), so the paper, not the sum, is the authority.
