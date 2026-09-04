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
    const { buffer, options } = e.data;
    const { PDFDocument, PDFName } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });

    if (options.flattenForms) {
      try {
        doc.getForm().flatten();
      } catch {
        // No form — ignore.
      }
    }

    if (options.removeAnnotations) {
      // Delete /Annots on every page — strips highlights, sticky notes,
      // freetext boxes, and any other markup annotations. Form-field
      // annotations already handled above by flatten() (which removes them).
      for (const page of doc.getPages()) {
        page.node.delete(PDFName.of('Annots'));
      }
    }

    const bytes = await doc.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
