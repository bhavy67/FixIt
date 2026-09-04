import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { PdfRedactOptions } from './options';

type Rect = { x: number; y: number; w: number; h: number };

const RASTER_SCALE = 2; // ~144 DPI — balance quality and size

export async function processPdfRedact(
  ctx: ProcessingContext<PdfRedactOptions>,
): Promise<ProcessingResult> {
  const { files, options, onProgress, signal } = ctx;

  const patterns = options.patterns
    .split('\n')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (patterns.length === 0) {
    throw new Error('Enter at least one word or phrase to redact.');
  }

  const file = files[0]!;
  onProgress(0.02);
  const buffer = await file.file.arrayBuffer();
  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const numPages = pdfDoc.numPages;

  // Phase 1: locate matches per page.
  const pageRects: Rect[][] = [];
  const pageSizes: { width: number; height: number }[] = [];
  let anyMatch = false;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    const page = await pdfDoc.getPage(pageNum);
    const unscaledViewport = page.getViewport({ scale: 1 });
    pageSizes.push({ width: unscaledViewport.width, height: unscaledViewport.height });

    const textContent = await page.getTextContent();
    const rects: Rect[] = [];

    for (const item of textContent.items) {
      if (!('str' in item) || !(item as { str: string }).str.trim()) continue;
      const typedItem = item as { str: string; transform: number[]; width: number };
      const str = options.caseSensitive ? typedItem.str : typedItem.str.toLowerCase();
      const matched = patterns.some((p) =>
        str.includes(options.caseSensitive ? p : p.toLowerCase()),
      );
      if (matched) {
        const transform = typedItem.transform;
        const d = transform[3] ?? 0;
        const tx = transform[4] ?? 0;
        const ty = transform[5] ?? 0;
        const h = Math.abs(d) || 10;
        rects.push({ x: tx - 1, y: ty - 2, w: typedItem.width + 2, h: h + 4 });
        anyMatch = true;
      }
    }

    pageRects.push(rects);
    onProgress(0.02 + (pageNum / numPages) * 0.28);
  }

  if (!anyMatch) {
    throw new Error('No matches found for the given words or phrases.');
  }

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

  // Phase 2: build a new PDF — copy clean pages verbatim, rasterize matched pages.
  const { PDFDocument } = await import('pdf-lib');
  const srcDoc = await PDFDocument.load(buffer);
  const newDoc = await PDFDocument.create();

  for (let i = 0; i < numPages; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    const size = pageSizes[i]!;
    const rects = pageRects[i] ?? [];

    if (rects.length === 0) {
      const [copied] = await newDoc.copyPages(srcDoc, [i]);
      newDoc.addPage(copied);
    } else {
      const page = await pdfDoc.getPage(i + 1);
      const viewport = page.getViewport({ scale: RASTER_SCALE });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      const ctx2d = canvas.getContext('2d');
      if (!ctx2d) throw new Error('Could not create canvas context.');

      // White background so JPEG-embedded pages don't show black bars.
      ctx2d.fillStyle = 'white';
      ctx2d.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvas, canvasContext: ctx2d, viewport }).promise;

      // Draw redaction rectangles in canvas pixel space.
      ctx2d.fillStyle = 'black';
      for (const r of rects) {
        const cx = r.x * RASTER_SCALE;
        const cy = viewport.height - (r.y + r.h) * RASTER_SCALE;
        const cw = r.w * RASTER_SCALE;
        const ch = r.h * RASTER_SCALE;
        ctx2d.fillRect(cx, cy, cw, ch);
      }

      const pngBlob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('canvas export failed'))),
          'image/png',
        ),
      );
      const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
      const image = await newDoc.embedPng(pngBytes);
      const newPage = newDoc.addPage([size.width, size.height]);
      newPage.drawImage(image, { x: 0, y: 0, width: size.width, height: size.height });
    }

    onProgress(0.3 + ((i + 1) / numPages) * 0.65);
  }

  const bytes = await newDoc.save();
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const base = file.name.replace(/\.pdf$/i, '');

  onProgress(1);
  return { outputs: [{ blob, filename: `${base}-redacted.pdf`, bytes: blob.size }] };
}
