/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfMetaViewWorkerInput, PdfMetaViewWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfMetaViewWorkerResult>): void {
  ctx.postMessage(message);
}

ctx.addEventListener('message', async (e: MessageEvent<PdfMetaViewWorkerInput>) => {
  try {
    const { buffer } = e.data;
    const { PDFDocument } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    const info = {
      title: doc.getTitle() ?? '',
      author: doc.getAuthor() ?? '',
      subject: doc.getSubject() ?? '',
      keywords: doc.getKeywords() ?? '',
      creator: doc.getCreator() ?? '',
      producer: doc.getProducer() ?? '',
      creationDate: doc.getCreationDate()?.toISOString() ?? '',
      modificationDate: doc.getModificationDate()?.toISOString() ?? '',
      pageCount: doc.getPageCount(),
    };

    post({ type: 'progress', value: 0.9 });
    post({ type: 'result', value: { json: JSON.stringify(info, null, 2) } });
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
