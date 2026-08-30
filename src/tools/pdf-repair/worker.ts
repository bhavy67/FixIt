/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfRepairWorkerInput, PdfRepairWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfRepairWorkerResult>, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfRepairWorkerInput>) => {
  try {
    const { buffer } = e.data;
    const { PDFDocument } = await import('pdf-lib');

    // Load with maximum tolerance — ignores encryption, capriciously missing xrefs, etc.
    const doc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });

    post({ type: 'progress', value: 0.7 });

    // Save with cross-reference streams rebuilt from scratch (most compatible output).
    const bytes = await doc.save({ useObjectStreams: false });

    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
