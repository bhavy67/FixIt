/// <reference lib="webworker" />
import type { WorkerMessage } from '@/core/worker-runner';
import type { ImagesToPdfWorkerInput, ImagesToPdfWorkerResult } from './worker-types';

const ctx = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage<ImagesToPdfWorkerResult>, transfer?: Transferable[]): void {
  if (transfer && transfer.length > 0) {
    ctx.postMessage(message, transfer);
  } else {
    ctx.postMessage(message);
  }
}

function isJpeg(buf: ArrayBuffer): boolean {
  const v = new Uint8Array(buf, 0, 3);
  return v[0] === 0xff && v[1] === 0xd8 && v[2] === 0xff;
}

function isPng(buf: ArrayBuffer): boolean {
  const v = new Uint8Array(buf, 0, 4);
  return v[0] === 0x89 && v[1] === 0x50 && v[2] === 0x4e && v[3] === 0x47;
}

async function toPngBuffer(buf: ArrayBuffer, mime: string): Promise<ArrayBuffer> {
  const blob = new Blob([buf], { type: mime || 'image/*' });
  const bitmap = await createImageBitmap(blob);
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const c = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D | null;
  if (!c) throw new Error('OffscreenCanvas unavailable');
  c.drawImage(bitmap, 0, 0);
  bitmap.close();
  const pngBlob = await canvas.convertToBlob({ type: 'image/png' });
  return pngBlob.arrayBuffer();
}

ctx.addEventListener('message', async (e: MessageEvent<ImagesToPdfWorkerInput>) => {
  try {
    const { buffers, mimes } = e.data;
    const { PDFDocument } = await import('pdf-lib');

    const doc = await PDFDocument.create();

    for (let i = 0; i < buffers.length; i++) {
      let buf = buffers[i]!;
      const mime = mimes[i] ?? '';

      let embeddedImage;
      if (isJpeg(buf)) {
        embeddedImage = await doc.embedJpg(buf);
      } else if (isPng(buf)) {
        embeddedImage = await doc.embedPng(buf);
      } else {
        buf = await toPngBuffer(buf, mime);
        embeddedImage = await doc.embedPng(buf);
      }

      const { width, height } = embeddedImage;
      const page = doc.addPage([width, height]);
      page.drawImage(embeddedImage, { x: 0, y: 0, width, height });

      post({ type: 'progress', value: (i + 1) / buffers.length });
    }

    const bytes = await doc.save();
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
