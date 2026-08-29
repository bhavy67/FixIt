import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfRotateOptions } from './options';
import type { PdfRotateWorkerInput, PdfRotateWorkerResult } from './worker-types';

export async function processPdfRotate(
  ctx: ProcessingContext<PdfRotateOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.1);
  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.pdf$/i, '');
  onProgress(0.3);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfRotateWorkerInput = { buffer, degrees: options.degrees, pages: options.pages };

  const { bytes } = await runInWorker<PdfRotateWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}-rotated.pdf`, bytes: blob.size }],
  };
}
