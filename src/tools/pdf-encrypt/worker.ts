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
    const { PDFDocument } = await import('@cantoo/pdf-lib');

    post({ type: 'progress', value: 0.2 });
    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    post({ type: 'progress', value: 0.5 });
    doc.encrypt({
      userPassword,
      ownerPassword: ownerPassword || userPassword,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: true,
        contentAccessibility: true,
        documentAssembly: false,
      },
    });

    post({ type: 'progress', value: 0.8 });
    const bytes = await doc.save();

    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
