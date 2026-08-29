import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfReorderOptions } from './options';
import type { PdfReorderWorkerInput, PdfReorderWorkerResult } from './worker-types';

export async function processPdfReorder(
  ctx: ProcessingContext<PdfReorderOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.1);
  const buffer = await files[0]!.file.arrayBuffer();
  onProgress(0.3);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfReorderWorkerInput = { buffer, order: options.order };

  const { bytes } = await runInWorker<PdfReorderWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: 'reordered.pdf', bytes: blob.size }],
  };
}
