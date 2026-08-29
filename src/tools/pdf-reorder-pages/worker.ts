/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfReorderWorkerInput, PdfReorderWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfReorderWorkerResult>, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfReorderWorkerInput>) => {
  try {
    const { buffer, order } = e.data;
    const { PDFDocument } = await import('pdf-lib');

    const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const total = src.getPageCount();

    // Parse order: "3, 1, 2, 4" → [2, 0, 1, 3] (0-based)
    const tokens = order.trim().split(',').map((s) => Number(s.trim()));
    if (tokens.some((n) => !Number.isFinite(n) || n < 1 || n > total)) {
      throw new Error(`Invalid page number in order. Pages must be between 1 and ${total}.`);
    }
    const indices = tokens.map((n) => n - 1);

    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, indices);
    copied.forEach((p) => out.addPage(p));

    post({ type: 'progress', value: 0.9 });
    const bytes = await out.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
