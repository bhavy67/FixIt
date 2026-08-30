/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfEncryptWorkerInput, PdfEncryptWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<PdfEncryptWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfEncryptWorkerInput>) => {
  try {
    const { buffer, userPassword, ownerPassword } = e.data;
    const { PDFDocument } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true, throwOnInvalidObject: false });
    // @ts-expect-error pdf-lib types don't expose encrypt() but the spec includes it
    await doc.encrypt({ userPassword, ownerPassword: ownerPassword || userPassword });
    const bytes = await doc.save();

    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
