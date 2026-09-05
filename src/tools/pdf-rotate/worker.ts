/// <reference lib="webworker" />
import { parsePageRange } from '@/core/pdf-page-range';
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfRotateWorkerInput, PdfRotateWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfRotateWorkerResult>, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfRotateWorkerInput>) => {
  try {
    const { buffer, degrees: rotation, pages } = e.data;
    const { PDFDocument, degrees } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const total = doc.getPageCount();
    const targetIndices = new Set(parsePageRange(pages, total));

    doc.getPages().forEach((page, i) => {
      if (targetIndices.has(i)) {
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + rotation) % 360));
      }
    });

    post({ type: 'progress', value: 0.9 });
    const bytes = await doc.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
