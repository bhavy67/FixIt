/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfHeadersFootersWorkerInput, PdfHeadersFootersWorkerResult } from './worker-types';
import type { Alignment } from './options';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<PdfHeadersFootersWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

function resolveTokens(template: string, page: number, total: number): string {
  return template.replace(/\{page\}/g, String(page)).replace(/\{total\}/g, String(total));
}

function calcX(alignment: Alignment, textWidth: number, pageWidth: number, margin: number): number {
  if (alignment === 'center') return (pageWidth - textWidth) / 2;
  if (alignment === 'right') return pageWidth - textWidth - margin;
  return margin; // left
}

const MARGIN = 28; // points (~10mm)

ctx.addEventListener('message', async (e: MessageEvent<PdfHeadersFootersWorkerInput>) => {
  try {
    const { buffer, headerText, footerText, fontSize, alignment } = e.data;
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true, throwOnInvalidObject: false });
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const total = pages.length;

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]!;
      const { width, height } = page.getSize();
      const pageNum = i + 1;

      const header = resolveTokens(headerText, pageNum, total).trim();
      if (header) {
        const textWidth = font.widthOfTextAtSize(header, fontSize);
        const x = calcX(alignment, textWidth, width, MARGIN);
        const y = height - MARGIN - fontSize;
        page.drawText(header, { x, y, size: fontSize, font, color: rgb(0, 0, 0), opacity: 0.7 });
      }

      const footer = resolveTokens(footerText, pageNum, total).trim();
      if (footer) {
        const textWidth = font.widthOfTextAtSize(footer, fontSize);
        const x = calcX(alignment, textWidth, width, MARGIN);
        const y = MARGIN;
        page.drawText(footer, { x, y, size: fontSize, font, color: rgb(0, 0, 0), opacity: 0.7 });
      }

      post({ type: 'progress', value: (i + 1) / pages.length });
    }

    const bytes = await doc.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
