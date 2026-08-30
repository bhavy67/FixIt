import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import type { PdfSignOptions } from './options';

export async function processPdfSign(
  ctx: ProcessingContext<PdfSignOptions>,
): Promise<ProcessingResult> {
  const { files, options, onProgress, signal } = ctx;

  if (!options.signatureDataUrl) {
    throw new Error('No signature drawn. Draw your signature in the pad above first.');
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

  const sizeMap: Record<typeof options.size, number> = { small: 0.15, medium: 0.25, large: 0.35 };
  const sigW = pw * sizeMap[options.size];
  const sigH = sigW * (pngImage.height / pngImage.width);
  const margin = pw * 0.05;

  const posMap: Record<typeof options.position, { x: number; y: number }> = {
    'bottom-left': { x: margin, y: margin },
    'bottom-center': { x: (pw - sigW) / 2, y: margin },
    'bottom-right': { x: pw - sigW - margin, y: margin },
    'top-left': { x: margin, y: ph - sigH - margin },
    'top-center': { x: (pw - sigW) / 2, y: ph - sigH - margin },
    'top-right': { x: pw - sigW - margin, y: ph - sigH - margin },
  };

  const { x, y } = posMap[options.position];
  page.drawImage(pngImage, { x, y, width: sigW, height: sigH });

  onProgress(0.9);
  if (signal.aborted) throw new DOMException('cancelled', 'AbortError');

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const base = file.name.replace(/\.pdf$/i, '');

  onProgress(1);
  return { outputs: [{ blob, filename: `${base}-signed.pdf`, bytes: blob.size }] };
}
