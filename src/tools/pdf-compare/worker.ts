/// <reference lib="webworker" />
import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { WorkerMessage } from '@/core/worker-runner';
import type {
  CompareOutput,
  PdfCompareWorkerInput,
  PdfCompareWorkerResult,
} from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<PdfCompareWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

async function renderPage(
  pdf: PDFDocumentProxy,
  pageNum: number,
  scale: number,
): Promise<OffscreenCanvas> {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = new OffscreenCanvas(Math.round(viewport.width), Math.round(viewport.height));
  const c = canvas.getContext('2d');
  if (!c) throw new Error('Could not create canvas context.');
  // pdfjs `render` types require HTMLCanvasElement + CanvasRenderingContext2D,
  // but at runtime OffscreenCanvas works. Cast through unknown to skip the
  // structural check.
  await page.render({
    canvasContext: c as unknown as CanvasRenderingContext2D,
    viewport,
    canvas: canvas as unknown as HTMLCanvasElement,
  }).promise;
  return canvas;
}

function buildDiffCanvas(
  canvasA: OffscreenCanvas,
  canvasB: OffscreenCanvas,
  threshold: number,
): { canvas: OffscreenCanvas; diffPixels: number; totalPixels: number } {
  const w = Math.max(canvasA.width, canvasB.width);
  const h = Math.max(canvasA.height, canvasB.height);

  const tempA = new OffscreenCanvas(w, h);
  const ctxA = tempA.getContext('2d')!;
  ctxA.fillStyle = 'white';
  ctxA.fillRect(0, 0, w, h);
  ctxA.drawImage(canvasA as unknown as CanvasImageSource, 0, 0);

  const tempB = new OffscreenCanvas(w, h);
  const ctxB = tempB.getContext('2d')!;
  ctxB.fillStyle = 'white';
  ctxB.fillRect(0, 0, w, h);
  ctxB.drawImage(canvasB as unknown as CanvasImageSource, 0, 0);

  const dataA = ctxA.getImageData(0, 0, w, h);
  const dataB = ctxB.getImageData(0, 0, w, h);

  const diff = new OffscreenCanvas(w, h);
  const diffCtx = diff.getContext('2d')!;
  const diffData = diffCtx.createImageData(w, h);

  let diffPixels = 0;
  const totalPixels = w * h;

  for (let i = 0; i < dataA.data.length; i += 4) {
    const dr = Math.abs((dataA.data[i] ?? 255) - (dataB.data[i] ?? 255));
    const dg = Math.abs((dataA.data[i + 1] ?? 255) - (dataB.data[i + 1] ?? 255));
    const db = Math.abs((dataA.data[i + 2] ?? 255) - (dataB.data[i + 2] ?? 255));

    if (dr > threshold || dg > threshold || db > threshold) {
      diffData.data[i] = 220;
      diffData.data[i + 1] = 30;
      diffData.data[i + 2] = 30;
      diffData.data[i + 3] = 255;
      diffPixels++;
    } else {
      diffData.data[i] = Math.round((dataA.data[i] ?? 255) * 0.35 + 165);
      diffData.data[i + 1] = Math.round((dataA.data[i + 1] ?? 255) * 0.35 + 165);
      diffData.data[i + 2] = Math.round((dataA.data[i + 2] ?? 255) * 0.35 + 165);
      diffData.data[i + 3] = 255;
    }
  }

  diffCtx.putImageData(diffData, 0, 0);
  return { canvas: diff, diffPixels, totalPixels };
}

function buildMissingPageCanvas(
  page: number,
  fileName: string,
  refCanvas: OffscreenCanvas | null,
): OffscreenCanvas {
  const w = refCanvas?.width ?? 612;
  const h = refCanvas?.height ?? 792;
  const canvas = new OffscreenCanvas(w, h);
  const c = canvas.getContext('2d')!;
  c.fillStyle = '#fff7d9';
  c.fillRect(0, 0, w, h);
  c.strokeStyle = '#c9a227';
  c.lineWidth = 4;
  c.strokeRect(2, 2, w - 4, h - 4);
  c.fillStyle = '#5c4400';
  c.textAlign = 'center';
  c.font = `bold ${Math.round(h / 20)}px system-ui, sans-serif`;
  c.fillText(`Page ${page}`, w / 2, h / 2 - h * 0.06);
  c.font = `${Math.round(h / 30)}px system-ui, sans-serif`;
  c.fillText(`only present in`, w / 2, h / 2);
  c.fillText(fileName, w / 2, h / 2 + h * 0.06);
  return canvas;
}

async function canvasToBytes(canvas: OffscreenCanvas): Promise<Uint8Array> {
  const blob = await canvas.convertToBlob({ type: 'image/png' });
  return new Uint8Array(await blob.arrayBuffer());
}

ctx.addEventListener('message', async (e: MessageEvent<PdfCompareWorkerInput>) => {
  try {
    const { buffers, names, options } = e.data;
    const [bufA, bufB] = buffers;
    const [nameA, nameB] = names;

    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();

    const [pdfA, pdfB] = await Promise.all([
      pdfjsLib.getDocument({ data: new Uint8Array(bufA) }).promise,
      pdfjsLib.getDocument({ data: new Uint8Array(bufB) }).promise,
    ]);

    const scale = options.scale;
    const totalPagesCompared = Math.min(pdfA.numPages, pdfB.numPages);
    const totalPagesEmitted = Math.max(pdfA.numPages, pdfB.numPages);
    const padLen = String(totalPagesEmitted).length;

    const outputs: CompareOutput[] = [];
    const pageSummaries: Array<{
      page: number;
      identical: boolean;
      similarity: string;
      note?: string;
    }> = [];

    for (let i = 1; i <= totalPagesCompared; i++) {
      const [canvasA, canvasB] = await Promise.all([
        renderPage(pdfA, i, scale),
        renderPage(pdfB, i, scale),
      ]);

      const { canvas: diffCanvas, diffPixels, totalPixels } = buildDiffCanvas(
        canvasA,
        canvasB,
        options.threshold,
      );
      const similarity = totalPixels > 0 ? 1 - diffPixels / totalPixels : 1;
      const identical = similarity >= 0.999;

      pageSummaries.push({
        page: i,
        identical,
        similarity: `${(similarity * 100).toFixed(1)}%`,
      });

      const bytes = await canvasToBytes(diffCanvas);
      outputs.push({
        filename: `diff-page-${String(i).padStart(padLen, '0')}.png`,
        bytes,
        mime: 'image/png',
      });

      post({ type: 'progress', value: (i / totalPagesEmitted) * 0.95 });
    }

    if (pdfA.numPages > totalPagesCompared) {
      for (let i = totalPagesCompared + 1; i <= pdfA.numPages; i++) {
        const canvasA = await renderPage(pdfA, i, scale);
        const marker = buildMissingPageCanvas(i, nameA, canvasA);
        const bytes = await canvasToBytes(marker);
        outputs.push({
          filename: `only-in-A-page-${String(i).padStart(padLen, '0')}.png`,
          bytes,
          mime: 'image/png',
        });
        pageSummaries.push({
          page: i,
          identical: false,
          similarity: '—',
          note: `only in "${nameA}"`,
        });
        post({ type: 'progress', value: (i / totalPagesEmitted) * 0.95 });
      }
    }
    if (pdfB.numPages > totalPagesCompared) {
      for (let i = totalPagesCompared + 1; i <= pdfB.numPages; i++) {
        const canvasB = await renderPage(pdfB, i, scale);
        const marker = buildMissingPageCanvas(i, nameB, canvasB);
        const bytes = await canvasToBytes(marker);
        outputs.push({
          filename: `only-in-B-page-${String(i).padStart(padLen, '0')}.png`,
          bytes,
          mime: 'image/png',
        });
        pageSummaries.push({
          page: i,
          identical: false,
          similarity: '—',
          note: `only in "${nameB}"`,
        });
        post({ type: 'progress', value: (i / totalPagesEmitted) * 0.95 });
      }
    }

    const identicalCount = pageSummaries.filter((p) => p.identical).length;
    const summary = {
      fileA: nameA,
      fileB: nameB,
      threshold: options.threshold,
      totalPagesCompared,
      totalPagesA: pdfA.numPages,
      totalPagesB: pdfB.numPages,
      identicalPages: identicalCount,
      differentPages: totalPagesCompared - identicalCount,
      pages: pageSummaries,
    };
    const summaryBytes = new TextEncoder().encode(JSON.stringify(summary, null, 2));
    outputs.unshift({
      filename: 'comparison-summary.json',
      bytes: summaryBytes,
      mime: 'application/json',
    });

    const transfer = outputs.map((o) => o.bytes.buffer as ArrayBuffer);
    post({ type: 'result', value: { outputs } }, transfer);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
