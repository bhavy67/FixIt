/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfUnlockWorkerInput, PdfUnlockWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<PdfUnlockWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfUnlockWorkerInput>) => {
  try {
    const { buffer, password } = e.data;
    const { PDFDocument } = await import('@cantoo/pdf-lib');

    // Try password-based decryption first; fall back to ignoreEncryption for
    // PDFs that only have restrictions but no user password.
    let doc;
    if (password) {
      doc = await PDFDocument.load(buffer, { password });
    } else {
      doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    }
    const bytes = await doc.save();

    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
