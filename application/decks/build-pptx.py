"""Builds the PowerPoint pitch deck from the PDF in ../submission.

    python build-pdf.py     (first: the PDF)
    python build-pptx.py    (then: Akshara-Mitra-Challenge-06-Pitch-Deck.pptx beside it)

Needs: pip install python-pptx pymupdf
"""
import html
import io
import json
import pathlib
import re

import pymupdf as fitz
from pptx import Presentation
from pptx.util import Emu

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / 'submission'
W, H = 12192000, 6858000  # 13.333 x 7.5 inches, 16:9
ZOOM = 2  # PDF pages are 1920 x 1080 px; this gives 3840 x 2160 pictures


def words(fragment: str) -> str:
    text = re.sub(r'<br\s*/?>|</t[dh]>', ' ', fragment)
    text = re.sub(r'</(?:p|h1|h2|h3|li|tr|div)>', '\n', text)
    text = html.unescape(re.sub(r'<[^>]+>', '', text))
    return '\n'.join(' '.join(line.split()) for line in text.splitlines() if line.strip())


def build():
    root = HERE / 'project'
    index = json.loads((root / 'deck.json').read_text(encoding='utf-8'))
    pdf_path = OUT / 'Akshara-Mitra-Challenge-06-Pitch-Deck.pdf'
    if not pdf_path.exists():
        raise SystemExit(f'{pdf_path} not found; run build-pdf.py first')

    pdf = fitz.open(pdf_path)
    if pdf.page_count != len(index['order']):
        raise SystemExit(f'The PDF has {pdf.page_count} pages but the deck has {len(index["order"])} slides; run build-pdf.py first')

    pres = Presentation()
    pres.slide_width, pres.slide_height = Emu(W), Emu(H)
    pres.core_properties.title = index['title']
    pres.core_properties.author = 'Gamada'
    layout = pres.slide_layouts[5]  # title only

    for page, slide_id in zip(pdf, index['order']):
        source = (root / 'slides' / f'{slide_id}.html').read_text(encoding='utf-8')
        aside = re.search(r'<aside>(.*?)</aside>', source, flags=re.S)
        body = re.sub(r'<aside>.*?</aside>', '', source, flags=re.S)
        heading = re.search(r'<h[12][^>]*>(.*?)</h[12]>', body, flags=re.S)
        title = ' '.join(words(heading.group(1)).split()) if heading else slide_id

        slide = pres.slides.add_slide(layout)
        picture = slide.shapes.add_picture(
            io.BytesIO(page.get_pixmap(matrix=fitz.Matrix(ZOOM, ZOOM), alpha=False).tobytes('png')),
            0,
            0,
            Emu(W),
            Emu(H),
        )
        picture._element.nvPicPr.cNvPr.set('descr', words(body))

        # Title names the slide for screen readers and slide list
        slide.shapes.title.text = title
        slide.shapes.title.left, slide.shapes.title.top = 0, Emu(-H // 5)
        slide.shapes.title.width, slide.shapes.title.height = Emu(W), Emu(H // 8)

        if aside:
            slide.notes_slide.notes_text_frame.text = words(aside.group(1))

    out = OUT / 'Akshara-Mitra-Challenge-06-Pitch-Deck.pptx'
    pres.save(out)
    print(f'Akshara Mitra: {pdf.page_count} slides -> {out.name} ({out.stat().st_size // 1024} KB)')
    return out


if __name__ == '__main__':
    build()
