/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfMergeWorkerInput, PdfMergeWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfMergeWorkerResult>, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfMergeWorkerInput>) => {
  try {
    const { buffers } = e.data;
    // Lazy import so pdf-lib is not in the main bundle.
    const { PDFDocument } = await import('pdf-lib');

    const merged = await PDFDocument.create();

    for (let i = 0; i < buffers.length; i++) {
      const src = await PDFDocument.load(buffers[i]!, { ignoreEncryption: true });
      const copied = await merged.copyPages(src, src.getPageIndices());
      copied.forEach((p) => merged.addPage(p));
      post({ type: 'progress', value: (i + 1) / buffers.length });
    }

    const bytes = await merged.save();
    // Transfer the underlying buffer so the copy back to the main thread is zero-cost.
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
