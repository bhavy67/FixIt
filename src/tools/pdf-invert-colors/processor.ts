import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { ColorFilter, PdfInvertColorsOptions } from './options';

const FILTER_CSS: Record<ColorFilter, string> = {
  invert: 'invert(1)',
  grayscale: 'grayscale(1)',
  sepia: 'sepia(1)',
};

export async function processPdfInvertColors(
  ctx: ProcessingContext<PdfInvertColorsOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.05);

  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.pdf$/i, '');

  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
  onProgress(0.1);

  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const { PDFDocument } = await import('pdf-lib');
  const newDoc = await PDFDocument.create();

  const filterStr = FILTER_CSS[options.filter];

  for (let i = 1; i <= pdf.numPages; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

    const pdfPage = await pdf.getPage(i);

    // Original dimensions in points (scale=1)
    const vp1 = pdfPage.getViewport({ scale: 1 });
    const originalWidthPt = vp1.width;
    const originalHeightPt = vp1.height;

    // Render at scale 1.5 for quality
    const vp = pdfPage.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(vp.width);
    canvas.height = Math.round(vp.height);
    const ctx2d = canvas.getContext('2d')!;
    await pdfPage.render({ canvasContext: ctx2d, viewport: vp, canvas }).promise;

    // Apply CSS filter via second canvas
    const fCanvas = document.createElement('canvas');
    fCanvas.width = canvas.width;
    fCanvas.height = canvas.height;
    const fCtx = fCanvas.getContext('2d')!;
    fCtx.filter = filterStr;
    fCtx.drawImage(canvas, 0, 0);

    // Export filtered canvas to PNG
    const blob = await new Promise<Blob>((resolve, reject) =>
      fCanvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('toBlob returned null'))),
        'image/png',
      ),
    );
    const pngBytes = new Uint8Array(await blob.arrayBuffer());

    // Embed PNG into new PDF
    const img = await newDoc.embedPng(pngBytes);
    const page = newDoc.addPage([originalWidthPt, originalHeightPt]);
    page.drawImage(img, { x: 0, y: 0, width: originalWidthPt, height: originalHeightPt });

    onProgress(0.1 + (i / pdf.numPages) * 0.85);
  }

  const bytes = await newDoc.save();
  const outBlob = new Blob([bytes as BlobPart], { type: 'application/pdf' });

  onProgress(1);
  return {
    outputs: [
      {
        blob: outBlob,
        filename: `${base}-${options.filter}.pdf`,
        bytes: outBlob.size,
      },
    ],
  };
}
