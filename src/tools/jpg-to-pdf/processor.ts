import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { JpgToPdfOptions } from './options';
import type { ImageToPdfWorkerInput, ImageToPdfWorkerResult } from './worker-types';

export async function processJpgToPdf(
  ctx: ProcessingContext<JpgToPdfOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;

  onProgress(0.05);
  const buffers: ArrayBuffer[] = [];
  const mimes: string[] = [];

  for (let i = 0; i < files.length; i++) {
    buffers.push(await files[i]!.file.arrayBuffer());
    mimes.push(files[i]!.mime);
    onProgress(0.05 + (i + 1) / files.length * 0.25);
  }

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: ImageToPdfWorkerInput = { buffers, mimes };

  const { bytes } = await runInWorker<ImageToPdfWorkerResult>({
    worker,
    input,
    transfer: buffers,
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const filename =
    files.length === 1
      ? `${files[0]!.name.replace(/\.[^.]+$/, '')}.pdf`
      : `images-${files.length}.pdf`;

  return {
    outputs: [{ blob, filename, bytes: blob.size }],
  };
}
