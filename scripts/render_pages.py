"""Generate offline facsimile pages. Only regeneration needs pypdfium2/Pillow."""
from pathlib import Path
import pypdfium2 as pdfium
ROOT = Path(__file__).resolve().parents[1]
out = ROOT / 'assets' / 'pdf-pages'
out.mkdir(exist_ok=True)
pdf = pdfium.PdfDocument(ROOT / '傅佩荣解读易经.pdf')
for i in range(len(pdf)):
    page = pdf[i]
    scale = 1600 / max(page.get_size())
    bitmap = page.render(scale=scale)
    image = bitmap.to_pil()
    image.save(out / f'{i + 1:03}.webp', 'WEBP', quality=86, method=4)
    image.close()
    bitmap.close()
    page.close()
    if (i + 1) % 25 == 0: print(f'{i + 1} / {len(pdf)}', flush=True)
print('Rendered', len(pdf), 'offline PDF pages.', flush=True)
pdf.close()
