import type { PDFDocumentProxy } from 'pdfjs-dist';
import type { ProcessingContext, ProcessingResult, ProcessingResultBlob } from '@/core/tool-types';
import type { PdfCompareOptions } from './options';

const DIFF_THRESHOLD = 15;

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
): { canvas: HTMLCanvasElement; diffPixels: number; totalPixels: number } {
  const w = Math.max(canvasA.width, canvasB.width);
  const h = Math.max(canvasA.height, canvasB.height);

  const tempA = document.createElement('canvas');
  tempA.width = w;
  tempA.height = h;
  tempA.getContext('2d')!.drawImage(canvasA, 0, 0);

  const tempB = document.createElement('canvas');
  tempB.width = w;
  tempB.height = h;
  tempB.getContext('2d')!.drawImage(canvasB, 0, 0);

  const dataA = tempA.getContext('2d')!.getImageData(0, 0, w, h);
  const dataB = tempB.getContext('2d')!.getImageData(0, 0, w, h);

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

    if (dr > DIFF_THRESHOLD || dg > DIFF_THRESHOLD || db > DIFF_THRESHOLD) {
      diffData.data[i] = 220;
      diffData.data[i + 1] = 30;
      diffData.data[i + 2] = 30;
      diffData.data[i + 3] = 255;
      diffPixels++;
    } else {
      // Fade identical pixels to show document structure
      diffData.data[i] = Math.round((dataA.data[i] ?? 255) * 0.35 + 165);
      diffData.data[i + 1] = Math.round((dataA.data[i + 1] ?? 255) * 0.35 + 165);
      diffData.data[i + 2] = Math.round((dataA.data[i + 2] ?? 255) * 0.35 + 165);
      diffData.data[i + 3] = 255;
    }
  }

  diffCtx.putImageData(diffData, 0, 0);
  return { canvas: diff, diffPixels, totalPixels };
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

  const nameA = files[0]!.name.replace(/\.pdf$/i, '');
  const nameB = files[1]!.name.replace(/\.pdf$/i, '');
  const totalPages = Math.min(pdfA.numPages, pdfB.numPages);
  const scale = options.scale;

  const outputs: ProcessingResultBlob[] = [];
  const pageSummaries: Array<{
    page: number;
    identical: boolean;
    similarity: string;
    note?: string;
  }> = [];

  for (let i = 1; i <= totalPages; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

    const [canvasA, canvasB] = await Promise.all([
      renderPage(pdfA, i, scale),
      renderPage(pdfB, i, scale),
    ]);

    const { canvas: diffCanvas, diffPixels, totalPixels } = buildDiffCanvas(canvasA, canvasB);
    const similarity = totalPixels > 0 ? 1 - diffPixels / totalPixels : 1;
    const identical = similarity >= 0.999;

    pageSummaries.push({
      page: i,
      identical,
      similarity: `${(similarity * 100).toFixed(1)}%`,
    });

    const blob = await canvasToBlob(diffCanvas, 'image/png', 1);
    const padLen = String(totalPages).length;
    outputs.push({
      blob,
      filename: `diff-page-${String(i).padStart(padLen, '0')}.png`,
      bytes: blob.size,
    });

    onProgress(0.1 + (i / totalPages) * 0.85);
  }

  // Append notes for pages that exist in only one document
  if (pdfA.numPages !== pdfB.numPages) {
    pageSummaries.push({
      page: -1,
      identical: false,
      similarity: '0%',
      note: `"${nameA}" has ${pdfA.numPages} pages; "${nameB}" has ${pdfB.numPages} pages. Only first ${totalPages} compared.`,
    });
  }

  const identicalCount = pageSummaries.filter((p) => p.identical && p.page > 0).length;
  const summary = {
    fileA: files[0]!.name,
    fileB: files[1]!.name,
    totalPagesCompared: totalPages,
    identicalPages: identicalCount,
    differentPages: totalPages - identicalCount,
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
