/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfInvertColorsWorkerInput, PdfInvertColorsWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;
const RASTER_SCALE = 2;

function post(
  message: WorkerMessage<PdfInvertColorsWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

async function invertWithBlendMode(buffer: ArrayBuffer): Promise<Uint8Array> {
  const { PDFDocument, BlendMode, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.load(buffer);
  const pageCount = doc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const page = doc.getPage(i);
    const { width, height } = page.getSize();
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(1, 1, 1),
      blendMode: BlendMode.Difference,
    });
    post({ type: 'progress', value: (i + 1) / pageCount });
  }
  return doc.save();
}

async function rasterizeWithFilter(
  buffer: ArrayBuffer,
  filter: 'grayscale' | 'sepia',
): Promise<Uint8Array> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();
  const filterCss = filter === 'grayscale' ? 'grayscale(1)' : 'sepia(1)';

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const { PDFDocument } = await import('pdf-lib');
  const newDoc = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const pdfPage = await pdf.getPage(i);
    const vp1 = pdfPage.getViewport({ scale: 1 });
    const vp = pdfPage.getViewport({ scale: RASTER_SCALE });

    const canvas = new OffscreenCanvas(Math.round(vp.width), Math.round(vp.height));
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) throw new Error('Could not create canvas context.');
    await pdfPage.render({
      canvasContext: ctx2d as unknown as CanvasRenderingContext2D,
      viewport: vp,
      canvas: canvas as unknown as HTMLCanvasElement,
    }).promise;

    const fCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    const fCtx = fCanvas.getContext('2d');
    if (!fCtx) throw new Error('Could not create canvas context.');
    fCtx.filter = filterCss;
    fCtx.drawImage(canvas as unknown as CanvasImageSource, 0, 0);

    const pngBlob = await fCanvas.convertToBlob({ type: 'image/png' });
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
    const img = await newDoc.embedPng(pngBytes);
    const page = newDoc.addPage([vp1.width, vp1.height]);
    page.drawImage(img, { x: 0, y: 0, width: vp1.width, height: vp1.height });

    post({ type: 'progress', value: i / pdf.numPages });
  }

  return newDoc.save();
}

ctx.addEventListener('message', async (e: MessageEvent<PdfInvertColorsWorkerInput>) => {
  try {
    const { buffer, options } = e.data;
    const bytes =
      options.filter === 'invert'
        ? await invertWithBlendMode(buffer)
        : await rasterizeWithFilter(buffer, options.filter);
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
