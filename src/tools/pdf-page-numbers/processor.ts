import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfPageNumbersOptions } from './options';
import type { PdfPageNumbersWorkerInput, PdfPageNumbersWorkerResult } from './worker-types';

export async function processPdfPageNumbers(
  ctx: ProcessingContext<PdfPageNumbersOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.1);
  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.pdf$/i, '');
  onProgress(0.3);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfPageNumbersWorkerInput = { buffer, options };

  const { bytes } = await runInWorker<PdfPageNumbersWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}-numbered.pdf`, bytes: blob.size }],
  };
}
