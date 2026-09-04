import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { PdfInvertColorsOptions } from './options';

const RASTER_SCALE = 2;

export async function processPdfInvertColors(
  ctx: ProcessingContext<PdfInvertColorsOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;
  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.pdf$/i, '');

  if (options.filter === 'invert') {
    return invertWithBlendMode(buffer, base, onProgress, signal);
  }
  return rasterizeWithFilter(buffer, base, options.filter, onProgress, signal);
}

/**
 * Vector-preserving invert: overlay white with Difference blend on every page.
 * Every color becomes its complement, text stays selectable.
 */
async function invertWithBlendMode(
  buffer: ArrayBuffer,
  base: string,
  onProgress: (n: number) => void,
  signal: AbortSignal,
): Promise<ProcessingResult> {
  onProgress(0.1);
  const { PDFDocument, BlendMode, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.load(buffer);

  const pageCount = doc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
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
    onProgress(0.1 + ((i + 1) / pageCount) * 0.85);
  }

  const bytes = await doc.save();
  const outBlob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  onProgress(1);
  return {
    outputs: [{ blob: outBlob, filename: `${base}-invert.pdf`, bytes: outBlob.size }],
  };
}

/**
 * Grayscale and sepia require pixel-level color manipulation that PDF blend
 * modes can't express with the ops pdf-lib exposes — so pages are rendered to
 * canvas, filtered, and re-embedded. Text becomes part of the image.
 */
async function rasterizeWithFilter(
  buffer: ArrayBuffer,
  base: string,
  filter: 'grayscale' | 'sepia',
  onProgress: (n: number) => void,
  signal: AbortSignal,
): Promise<ProcessingResult> {
  onProgress(0.05);
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const filterCss = filter === 'grayscale' ? 'grayscale(1)' : 'sepia(1)';

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const { PDFDocument } = await import('pdf-lib');
  const newDoc = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    const pdfPage = await pdf.getPage(i);
    const vp1 = pdfPage.getViewport({ scale: 1 });
    const vp = pdfPage.getViewport({ scale: RASTER_SCALE });

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) throw new Error('Could not create canvas context.');
    await pdfPage.render({ canvasContext: ctx2d, viewport: vp, canvas }).promise;

    const fCanvas = document.createElement('canvas');
    fCanvas.width = canvas.width;
    fCanvas.height = canvas.height;
    const fCtx = fCanvas.getContext('2d');
    if (!fCtx) throw new Error('Could not create canvas context.');
    fCtx.filter = filterCss;
    fCtx.drawImage(canvas, 0, 0);

    const pngBlob = await new Promise<Blob>((resolve, reject) =>
      fCanvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('canvas export failed'))),
        'image/png',
      ),
    );
    const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
    const img = await newDoc.embedPng(pngBytes);
    const page = newDoc.addPage([vp1.width, vp1.height]);
    page.drawImage(img, { x: 0, y: 0, width: vp1.width, height: vp1.height });

    onProgress(0.05 + (i / pdf.numPages) * 0.9);
  }

  const bytes = await newDoc.save();
  const outBlob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  onProgress(1);
  return {
    outputs: [{ blob: outBlob, filename: `${base}-${filter}.pdf`, bytes: outBlob.size }],
  };
}
