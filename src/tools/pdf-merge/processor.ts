import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfMergeOptions } from './options';
import type { PdfMergeWorkerInput, PdfMergeWorkerResult } from './worker-types';

function outputFilename(count: number): string {
  return `merged-${count}-files.pdf`;
}

export async function processPdfMerge(
  ctx: ProcessingContext<PdfMergeOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;

  // Read all files to ArrayBuffers on the main thread — cheap, and we need
  // ArrayBuffers as transferables anyway. Reading is the first 30% of progress.
  const buffers: ArrayBuffer[] = [];
  for (let i = 0; i < files.length; i++) {
    if (signal.aborted) throw new DOMException('cancelled', 'AbortError');
    onProgress((i / files.length) * 0.3);
    buffers.push(await files[i]!.file.arrayBuffer());
  }

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

  const input: PdfMergeWorkerInput = { buffers };

  const { bytes } = await runInWorker<PdfMergeWorkerResult>({
    worker,
    input,
    transfer: buffers,
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [
      {
        blob,
        filename: outputFilename(files.length),
        bytes: blob.size,
      },
    ],
    meta: { count: files.length },
  };
}
