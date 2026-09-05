/// <reference lib="webworker" />
import { parsePageRange } from '@/core/pdf-page-range';
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfDeleteWorkerInput, PdfDeleteWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfDeleteWorkerResult>, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfDeleteWorkerInput>) => {
  try {
    const { buffer, pages } = e.data;
    const { PDFDocument } = await import('pdf-lib');

    const src = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const total = src.getPageCount();
    const deleteSet = new Set(parsePageRange(pages, total));
    const keepIndices = Array.from({ length: total }, (_, i) => i).filter((i) => !deleteSet.has(i));

    const out = await PDFDocument.create();
    const copied = await out.copyPages(src, keepIndices);
    copied.forEach((p) => out.addPage(p));

    post({ type: 'progress', value: 0.9 });
    const bytes = await out.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
