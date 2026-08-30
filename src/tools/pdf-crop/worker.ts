/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { PdfCropOptions } from './options';

type WorkerInput = {
  buffer: ArrayBuffer;
  options: PdfCropOptions;
};

self.onmessage = async (e: MessageEvent<WorkerInput>) => {
  const { buffer, options } = e.data;
  try {
    const { PDFDocument } = await import('pdf-lib');
    const pdfDoc = await PDFDocument.load(buffer);
    const MM_TO_PT = 2.8346;
    const factor = options.unit === 'mm' ? MM_TO_PT : 1;
    const top = options.top * factor;
    const right = options.right * factor;
    const bottom = options.bottom * factor;
    const left = options.left * factor;

    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const page = pdfDoc.getPage(i);
      const { width, height } = page.getSize();
      const cropW = width - left - right;
      const cropH = height - top - bottom;
      if (cropW > 0 && cropH > 0) {
        page.setCropBox(left, bottom, cropW, cropH);
      }
    }

    const bytes = await pdfDoc.save();
    (self as unknown as DedicatedWorkerGlobalScope).postMessage(
      { type: 'result', value: bytes } as WorkerMessage<Uint8Array>,
      [bytes.buffer],
    );
  } catch (err) {
    (self as unknown as DedicatedWorkerGlobalScope).postMessage(
      {
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to crop PDF',
      } as WorkerMessage<never>,
    );
  }
};
