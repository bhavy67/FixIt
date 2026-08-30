/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfWatermarkWorkerInput, PdfWatermarkWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfWatermarkWorkerResult>, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfWatermarkWorkerInput>) => {
  try {
    const { buffer, text, opacity, rotation, fontSize } = e.data;
    const { PDFDocument, rgb, degrees, StandardFonts } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const pages = doc.getPages();

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]!;
      const { width, height } = page.getSize();
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      // Place text origin so the watermark is approximately centred after rotation.
      const rad = (rotation * Math.PI) / 180;
      const cx = width / 2;
      const cy = height / 2;
      const x = cx - (textWidth / 2) * Math.cos(rad) + (fontSize / 2) * Math.sin(rad);
      const y = cy - (textWidth / 2) * Math.sin(rad) - (fontSize / 2) * Math.cos(rad);

      page.drawText(text, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0.4, 0.4, 0.4),
        opacity,
        rotate: degrees(rotation),
      });

      post({ type: 'progress', value: (i + 1) / pages.length });
    }

    const bytes = await doc.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
