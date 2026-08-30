/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfFlattenWorkerInput, PdfFlattenWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<PdfFlattenWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfFlattenWorkerInput>) => {
  try {
    const { buffer } = e.data;
    const { PDFDocument } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true, throwOnInvalidObject: false });
    try {
      doc.getForm().flatten();
    } catch {
      // no form — ignore
    }
    const bytes = await doc.save();

    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
