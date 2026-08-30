/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfFormFillWorkerInput, PdfFormFillWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(
  message: WorkerMessage<PdfFormFillWorkerResult>,
  transfer?: Transferable[],
): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfFormFillWorkerInput>) => {
  try {
    const { buffer, fields, flatten } = e.data;
    const { PDFDocument } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
    });
    const form = doc.getForm();

    // Parse fields string: "name: value\n..."
    const pairs = fields
      .split('\n')
      .map((line) => {
        const colonIdx = line.indexOf(':');
        if (colonIdx === -1) return null;
        return { name: line.slice(0, colonIdx).trim(), value: line.slice(colonIdx + 1).trim() };
      })
      .filter((p): p is { name: string; value: string } => p !== null);

    for (const { name, value } of pairs) {
      try {
        const field = form.getTextField(name);
        field.setText(value);
      } catch {
        // Field not found or wrong type — try checkbox
        try {
          const check = form.getCheckBox(name);
          if (
            value.toLowerCase() === 'true' ||
            value === '1' ||
            value.toLowerCase() === 'yes'
          ) {
            check.check();
          } else {
            check.uncheck();
          }
        } catch {
          /* ignore */
        }
      }
    }

    if (flatten) {
      try {
        form.flatten();
      } catch {
        /* ignore */
      }
    }

    post({ type: 'progress', value: 0.9 });

    const bytes = await doc.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
