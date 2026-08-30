import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { PdfRedactOptions } from './options';

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
  onProgress(0.05);
  const buffer = await file.file.arrayBuffer();
  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const numPages = pdfDoc.numPages;

  type Rect = { x: number; y: number; w: number; h: number };
  const pageRects: Rect[][] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    const page = await pdfDoc.getPage(pageNum);
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
      }
    }

    pageRects.push(rects);
    onProgress(0.05 + (pageNum / numPages) * 0.5);
  }

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

  const { PDFDocument, rgb } = await import('pdf-lib');
  const pdfLibDoc = await PDFDocument.load(buffer);

  for (let i = 0; i < numPages; i++) {
    const page = pdfLibDoc.getPage(i);
    for (const r of pageRects[i] ?? []) {
      page.drawRectangle({ x: r.x, y: r.y, width: r.w, height: r.h, color: rgb(0, 0, 0) });
    }
    onProgress(0.55 + ((i + 1) / numPages) * 0.4);
  }

  const bytes = await pdfLibDoc.save();
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const base = file.name.replace(/\.pdf$/i, '');

  onProgress(1);
  return { outputs: [{ blob, filename: `${base}-redacted.pdf`, bytes: blob.size }] };
}
