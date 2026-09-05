/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfRedactWorkerInput, PdfRedactWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;
const RASTER_SCALE = 2;

function post(
  message: WorkerMessage<PdfRedactWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

type Rect = { x: number; y: number; w: number; h: number };

ctx.addEventListener('message', async (e: MessageEvent<PdfRedactWorkerInput>) => {
  try {
    const { buffer, options } = e.data;
    const patterns = options.patterns
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (patterns.length === 0) {
      post({ type: 'error', message: 'Enter at least one word or phrase to redact.' });
      return;
    }

    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();

    const pdfDoc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
    const numPages = pdfDoc.numPages;

    const pageRects: Rect[][] = [];
    const pageSizes: { width: number; height: number }[] = [];
    let anyMatch = false;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
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
      post({ type: 'progress', value: (pageNum / numPages) * 0.3 });
    }

    if (!anyMatch) {
      post({ type: 'error', message: 'No matches found for the given words or phrases.' });
      return;
    }

    const { PDFDocument } = await import('pdf-lib');
    const srcDoc = await PDFDocument.load(buffer);
    const newDoc = await PDFDocument.create();

    for (let i = 0; i < numPages; i++) {
      const size = pageSizes[i]!;
      const rects = pageRects[i] ?? [];

      if (rects.length === 0) {
        const [copied] = await newDoc.copyPages(srcDoc, [i]);
        newDoc.addPage(copied);
      } else {
        const page = await pdfDoc.getPage(i + 1);
        const viewport = page.getViewport({ scale: RASTER_SCALE });
        const canvas = new OffscreenCanvas(
          Math.ceil(viewport.width),
          Math.ceil(viewport.height),
        );
        const ctx2d = canvas.getContext('2d');
        if (!ctx2d) throw new Error('Could not create canvas context.');

        ctx2d.fillStyle = 'white';
        ctx2d.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({
          canvas: canvas as unknown as HTMLCanvasElement,
          canvasContext: ctx2d as unknown as CanvasRenderingContext2D,
          viewport,
        }).promise;

        ctx2d.fillStyle = 'black';
        for (const r of rects) {
          const cx = r.x * RASTER_SCALE;
          const cy = viewport.height - (r.y + r.h) * RASTER_SCALE;
          const cw = r.w * RASTER_SCALE;
          const ch = r.h * RASTER_SCALE;
          ctx2d.fillRect(cx, cy, cw, ch);
        }

        const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
        const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
        const image = await newDoc.embedPng(pngBytes);
        const newPage = newDoc.addPage([size.width, size.height]);
        newPage.drawImage(image, { x: 0, y: 0, width: size.width, height: size.height });
      }

      post({ type: 'progress', value: 0.3 + ((i + 1) / numPages) * 0.65 });
    }

    const bytes = await newDoc.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
