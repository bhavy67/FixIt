/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfCompressWorkerInput, PdfCompressWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfCompressWorkerResult>, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfCompressWorkerInput>) => {
  try {
    const { buffer, stripMetadata } = e.data;
    const { PDFDocument, PDFName } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    if (stripMetadata) {
      doc.setTitle('');
      doc.setAuthor('');
      doc.setSubject('');
      doc.setKeywords([]);
      doc.setCreator('');
      doc.setProducer('');
      doc.catalog.delete(PDFName.of('Metadata'));
      doc.catalog.delete(PDFName.of('PieceInfo'));
      for (const page of doc.getPages()) {
        page.node.delete(PDFName.of('Thumb'));
        page.node.delete(PDFName.of('PieceInfo'));
        page.node.delete(PDFName.of('Metadata'));
      }
    }

    post({ type: 'progress', value: 0.8 });
    const bytes = await doc.save({ useObjectStreams: true });
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
