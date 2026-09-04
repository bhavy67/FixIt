/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfCropOptions } from './options';

type WorkerInput = {
  buffer: ArrayBuffer;
  options: PdfCropOptions;
};

const MM_TO_PT = 2.83464567;

self.onmessage = async (e: MessageEvent<WorkerInput>) => {
  const { buffer, options } = e.data;
  try {
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(buffer);
    const factor = options.unit === 'mm' ? MM_TO_PT : 1;
    const top = options.top * factor;
    const right = options.right * factor;
    const bottom = options.bottom * factor;
    const left = options.left * factor;

    const pageCount = pdfDoc.getPageCount();
    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const cropW = width - left - right;
      const cropH = height - top - bottom;
      if (cropW > 0 && cropH > 0) {
        // Setting MediaBox is the authoritative crop — every viewer clips to
        // it. CropBox/BleedBox/TrimBox/ArtBox are kept in sync so downstream
        // tools that respect any of them see the same region.
        page.setMediaBox(left, bottom, cropW, cropH);
        page.setCropBox(left, bottom, cropW, cropH);
        page.setBleedBox(left, bottom, cropW, cropH);
        page.setTrimBox(left, bottom, cropW, cropH);
        page.setArtBox(left, bottom, cropW, cropH);
      }
      (self as unknown as DedicatedWorkerGlobalScope).postMessage({
        type: 'progress',
        value: (i + 1) / pageCount,
      } as WorkerMessage<Uint8Array>);
    }

    const bytes = await pdfDoc.save();
    (self as unknown as DedicatedWorkerGlobalScope).postMessage(
      { type: 'result', value: bytes } as WorkerMessage<Uint8Array>,
      [bytes.buffer as ArrayBuffer],
    );
  } catch (err) {
    (self as unknown as DedicatedWorkerGlobalScope).postMessage({
      type: 'error',
      message: err instanceof Error ? err.message : 'Failed to crop PDF',
    } as WorkerMessage<never>);
  }
};
