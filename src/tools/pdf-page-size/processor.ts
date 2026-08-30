import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfPageSizeOptions } from './options';
import type { PdfPageSizeWorkerInput, PdfPageSizeWorkerResult } from './worker-types';

export async function processPdfPageSize(
  ctx: ProcessingContext<PdfPageSizeOptions>,
): Promise<ProcessingResult> {
  const { files, signal, onProgress } = ctx;

  onProgress(0.1);
  const buffer = await files[0]!.file.arrayBuffer();
  onProgress(0.3);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfPageSizeWorkerInput = { buffer };

  const { json } = await runInWorker<PdfPageSizeWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  const blob = new Blob([json], { type: 'application/json' });
  return {
    outputs: [{ blob, filename: 'page-sizes.json', bytes: blob.size }],
  };
}
