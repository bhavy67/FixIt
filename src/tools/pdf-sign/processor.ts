import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { PdfSignOptions } from './options';

export async function processPdfSign(
  ctx: ProcessingContext<PdfSignOptions>,
): Promise<ProcessingResult> {
  const { files, options, onProgress, signal } = ctx;

  if (!options.signatureDataUrl) {
    throw new Error(
      options.signMode === 'type'
        ? 'No signature typed. Enter your name in the Type tab first.'
        : 'No signature drawn. Draw your signature in the pad first.',
    );
  }

  const file = files[0]!;
  onProgress(0.1);
  const buffer = await file.file.arrayBuffer();
  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

  onProgress(0.3);
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.load(buffer);

  const base64 = options.signatureDataUrl.split(',')[1] ?? '';
  const pngBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const pngImage = await pdfDoc.embedPng(pngBytes);

  onProgress(0.6);

  const pageIndex = Math.max(0, Math.min(options.page - 1, pdfDoc.getPageCount() - 1));
  const page = pdfDoc.getPage(pageIndex);
  const { width: pw, height: ph } = page.getSize();

  // sigX/sigY are normalized fractions with screen-coords origin (top-left)
  // PDF origin is bottom-left, so we flip sigY
  const sigW = options.sigW * pw;
  const sigH = sigW * (pngImage.height / pngImage.width);
  const x = options.sigX * pw;
  // Convert: screen top-left (sigY=0) → PDF bottom-left
  const y = ph - options.sigY * ph - sigH;

  page.drawImage(pngImage, {
    x: Math.max(0, x),
    y: Math.max(0, y),
    width: sigW,
    height: sigH,
  });

  onProgress(0.9);
  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const base = file.name.replace(/\.pdf$/i, '');

  onProgress(1);
  return { outputs: [{ blob, filename: `${base}-signed.pdf`, bytes: blob.size }] };
}
