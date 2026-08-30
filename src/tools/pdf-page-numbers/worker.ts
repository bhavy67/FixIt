/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfPageNumbersWorkerInput, PdfPageNumbersWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<PdfPageNumbersWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

const MARGIN = 28; // points (~10mm)

ctx.addEventListener('message', async (e: MessageEvent<PdfPageNumbersWorkerInput>) => {
  try {
    const { buffer, position, startNumber, prefix, fontSize } = e.data;
    const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const isTop = position.startsWith('top');

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]!;
      const { width, height } = page.getSize();
      const label = `${prefix}${startNumber + i}`;
      const textWidth = font.widthOfTextAtSize(label, fontSize);

      let x: number;
      if (position.endsWith('center')) {
        x = (width - textWidth) / 2;
      } else if (position.endsWith('right')) {
        x = width - textWidth - MARGIN;
      } else {
        x = MARGIN;
      }

      const y = isTop ? height - MARGIN - fontSize : MARGIN;

      page.drawText(label, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
        opacity: 0.7,
      });

      post({ type: 'progress', value: (i + 1) / pages.length });
    }

    const bytes = await doc.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
