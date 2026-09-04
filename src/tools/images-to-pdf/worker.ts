/// <reference lib="webworker" />
import { buildImagePdf } from '@/core/image-to-pdf';
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

ctx.addEventListener('message', async (e: MessageEvent<ImagesToPdfWorkerInput>) => {
  try {
    const { buffers, mimes, options } = e.data;
    const bytes = await buildImagePdf({
      buffers,
      mimes,
      options,
      onProgress: (p) => post({ type: 'progress', value: p }),
    });
    post({ type: 'result', value: { bytes } }, [bytes.buffer as ArrayBuffer]);
  } catch (err) {
    post({ type: 'error', message: err instanceof Error ? err.message : String(err) });
  }
});
