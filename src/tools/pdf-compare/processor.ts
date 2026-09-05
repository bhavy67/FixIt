import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { ProcessingContext, ProcessingResult, ProcessingResultBlob } from '@/core/tool-types';
import type { PdfCompareOptions } from './options';

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))),
      type,
      quality,
    );
  });
}

async function renderPage(
  pdf: PDFDocumentProxy,
  pageNum: number,
  scale: number,
): Promise<HTMLCanvasElement> {
  const page = await pdf.getPage(pageNum);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext('2d')!;
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;
  return canvas;
}

function buildDiffCanvas(
  canvasA: HTMLCanvasElement,
  canvasB: HTMLCanvasElement,
  threshold: number,
): { canvas: HTMLCanvasElement; diffPixels: number; totalPixels: number } {
  const w = Math.max(canvasA.width, canvasB.width);
  const h = Math.max(canvasA.height, canvasB.height);

  const tempA = document.createElement('canvas');
  tempA.width = w;
  tempA.height = h;
  const ctxA = tempA.getContext('2d')!;
  ctxA.fillStyle = 'white';
  ctxA.fillRect(0, 0, w, h);
  ctxA.drawImage(canvasA, 0, 0);

  const tempB = document.createElement('canvas');
  tempB.width = w;
  tempB.height = h;
  const ctxB = tempB.getContext('2d')!;
  ctxB.fillStyle = 'white';
  ctxB.fillRect(0, 0, w, h);
  ctxB.drawImage(canvasB, 0, 0);

  const dataA = ctxA.getImageData(0, 0, w, h);
  const dataB = ctxB.getImageData(0, 0, w, h);

  const diff = document.createElement('canvas');
  diff.width = w;
  diff.height = h;
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
  refCanvas: HTMLCanvasElement | null,
): HTMLCanvasElement {
  const w = refCanvas?.width ?? 612;
  const h = refCanvas?.height ?? 792;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  // Yellow banner background so it's visually distinct.
  ctx.fillStyle = '#fff7d9';
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, w - 4, h - 4);
  ctx.fillStyle = '#5c4400';
  ctx.textAlign = 'center';
  ctx.font = `bold ${Math.round(h / 20)}px system-ui, sans-serif`;
  ctx.fillText(`Page ${page}`, w / 2, h / 2 - h * 0.06);
  ctx.font = `${Math.round(h / 30)}px system-ui, sans-serif`;
  ctx.fillText(`only present in`, w / 2, h / 2);
  ctx.fillText(fileName, w / 2, h / 2 + h * 0.06);
  return canvas;
}

export async function processPdfCompare(
  ctx: ProcessingContext<PdfCompareOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  onProgress(0.05);

  const [bufA, bufB] = await Promise.all([
    files[0]!.file.arrayBuffer(),
    files[1]!.file.arrayBuffer(),
  ]);

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.1);

  const [pdfA, pdfB] = await Promise.all([
    pdfjsLib.getDocument({ data: new Uint8Array(bufA) }).promise,
    pdfjsLib.getDocument({ data: new Uint8Array(bufB) }).promise,
  ]);

  const nameA = files[0]!.name;
  const nameB = files[1]!.name;
  const scale = options.scale;
  const totalPagesCompared = Math.min(pdfA.numPages, pdfB.numPages);
  const totalPagesEmitted = Math.max(pdfA.numPages, pdfB.numPages);
  const padLen = String(totalPagesEmitted).length;

  const outputs: ProcessingResultBlob[] = [];
  const pageSummaries: Array<{
    page: number;
    identical: boolean;
    similarity: string;
    note?: string;
  }> = [];

  for (let i = 1; i <= totalPagesCompared; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

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

    const blob = await canvasToBlob(diffCanvas, 'image/png', 1);
    outputs.push({
      blob,
      filename: `diff-page-${String(i).padStart(padLen, '0')}.png`,
      bytes: blob.size,
    });

    onProgress(0.1 + (i / totalPagesEmitted) * 0.85);
  }

  // Emit marker pages for pages present in only one file.
  if (pdfA.numPages > totalPagesCompared) {
    for (let i = totalPagesCompared + 1; i <= pdfA.numPages; i++) {
      if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
      const canvasA = await renderPage(pdfA, i, scale);
      const marker = buildMissingPageCanvas(i, nameA, canvasA);
      const blob = await canvasToBlob(marker, 'image/png', 1);
      outputs.push({
        blob,
        filename: `only-in-A-page-${String(i).padStart(padLen, '0')}.png`,
        bytes: blob.size,
      });
      pageSummaries.push({
        page: i,
        identical: false,
        similarity: '—',
        note: `only in "${nameA}"`,
      });
      onProgress(0.1 + (i / totalPagesEmitted) * 0.85);
    }
  }
  if (pdfB.numPages > totalPagesCompared) {
    for (let i = totalPagesCompared + 1; i <= pdfB.numPages; i++) {
      if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
      const canvasB = await renderPage(pdfB, i, scale);
      const marker = buildMissingPageCanvas(i, nameB, canvasB);
      const blob = await canvasToBlob(marker, 'image/png', 1);
      outputs.push({
        blob,
        filename: `only-in-B-page-${String(i).padStart(padLen, '0')}.png`,
        bytes: blob.size,
      });
      pageSummaries.push({
        page: i,
        identical: false,
        similarity: '—',
        note: `only in "${nameB}"`,
      });
      onProgress(0.1 + (i / totalPagesEmitted) * 0.85);
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

  const summaryBlob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
  outputs.unshift({
    blob: summaryBlob,
    filename: 'comparison-summary.json',
    bytes: summaryBlob.size,
  });

  onProgress(1);
  return { outputs };
}
