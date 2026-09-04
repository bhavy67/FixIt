/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfMetaRemoveWorkerInput, PdfMetaRemoveWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<PdfMetaRemoveWorkerResult>, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

ctx.addEventListener('message', async (e: MessageEvent<PdfMetaRemoveWorkerInput>) => {
  try {
    const { buffer } = e.data;
    const { PDFDocument, PDFName } = await import('pdf-lib');

    const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });

    // Info dict (title, author, subject, keywords, creator, producer, creation/mod dates).
    doc.setTitle('');
    doc.setAuthor('');
    doc.setSubject('');
    doc.setKeywords([]);
    doc.setCreator('');
    doc.setProducer('');

    // XMP metadata stream lives on the Catalog under /Metadata.
    doc.catalog.delete(PDFName.of('Metadata'));

    // PieceInfo can hold app-specific tracking data (Photoshop, Illustrator).
    doc.catalog.delete(PDFName.of('PieceInfo'));

    // Per-page: /Thumb (embedded thumbnail image), /PieceInfo, and /Metadata.
    for (const page of doc.getPages()) {
      page.node.delete(PDFName.of('Thumb'));
      page.node.delete(PDFName.of('PieceInfo'));
      page.node.delete(PDFName.of('Metadata'));
    }

    post({ type: 'progress', value: 0.8 });
    // Save without preserving object streams to guarantee any orphaned XMP/thumb
    // objects don't survive as unreferenced blobs.
    const bytes = await doc.save({ useObjectStreams: false });
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
