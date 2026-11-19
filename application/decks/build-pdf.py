"""Renders the Akshara Mitra pitch deck to PDF for the TISC upload.

Run from this folder:  python build-pdf.py
Output:  ../submission/Akshara-Mitra-Challenge-06-Pitch-Deck.pdf
"""
import json
import pathlib
import subprocess
import sys
import tempfile
import time

HERE = pathlib.Path(__file__).resolve().parent
OUT = HERE.parent / 'submission'
EDGE = next(
    (b for b in [
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
    ] if pathlib.Path(b).exists()),
    'msedge',
)

CSS = """
@page { size: 1920px 1080px; margin: 0; }
* { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
html, body { margin: 0; padding: 0; }
section { width: 1920px; height: 1080px; position: relative; overflow: hidden; break-after: page; }
h1, h2, h3, p, ul, ol, table { margin: 0; }
ul, ol { padding-left: 1.2em; }
li { margin: 0.22em 0; }
table { border-collapse: collapse; width: 100%; }
td, th { padding: 0.35em 0.6em 0.35em 0; vertical-align: top; }
th { font-weight: 600; }
aside { display: none; }
img { display: block; }
svg { display: block; }
"""


def build():
    root = HERE / 'project'
    index = json.loads((root / 'deck.json').read_text(encoding='utf-8'))
    fonts = sorted({f['href'] for f in index['faces'].values() if 'href' in f})
    parts = []
    for slide_id in index['order']:
        html = (root / 'slides' / f'{slide_id}.html').read_text(encoding='utf-8')
        parts.append(html)

    page = (
        '<!doctype html><html><head><meta charset="utf-8">'
        + f'<title>{index["title"]}</title>'
        + ''.join(f'<link rel="stylesheet" href="{h}">' for h in fonts)
        + f'<style>{CSS}</style></head><body>' + '\n'.join(parts) + '</body></html>'
    )
    html_file = HERE / 'deck-print.html'
    html_file.write_text(page, encoding='utf-8')

    OUT.mkdir(parents=True, exist_ok=True)
    pdf = OUT / 'Akshara-Mitra-Challenge-06-Pitch-Deck.pdf'
    if pdf.exists():
        pdf.unlink()

    with tempfile.TemporaryDirectory(prefix='am-deck-', ignore_cleanup_errors=True) as profile:
        subprocess.run(
            [
                EDGE,
                '--headless=new',
                '--disable-gpu',
                '--no-first-run',
                f'--user-data-dir={profile}',
                '--no-pdf-header-footer',
                '--virtual-time-budget=10000',
                f'--print-to-pdf={pdf}',
                html_file.as_uri(),
            ],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        for _ in range(40):
            if pdf.exists() and pdf.stat().st_size > 0:
                break
            time.sleep(0.5)

    if not pdf.exists():
        sys.exit(f'Edge did not produce {pdf}')
    print(f'Akshara Mitra: {len(index["order"])} slides -> {pdf.name} ({pdf.stat().st_size // 1024} KB)')
    return pdf


if __name__ == '__main__':
    build()
