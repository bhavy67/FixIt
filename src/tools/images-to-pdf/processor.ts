import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { ImagesToPdfOptions } from './options';
import type { ImagesToPdfWorkerInput, ImagesToPdfWorkerResult } from './worker-types';

export async function processImagesToPdf(
  ctx: ProcessingContext<ImagesToPdfOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.05);
  const buffers: ArrayBuffer[] = [];
  const mimes: string[] = [];

  for (let i = 0; i < files.length; i++) {
    buffers.push(await files[i]!.file.arrayBuffer());
    mimes.push(files[i]!.mime);
    onProgress(0.05 + ((i + 1) / files.length) * 0.25);
  }

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: ImagesToPdfWorkerInput = { buffers, mimes, options };

  const { bytes } = await runInWorker<ImagesToPdfWorkerResult>({
    worker,
    input,
    transfer: buffers,
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `combined-${files.length}-images.pdf`, bytes: blob.size }],
  };
}
