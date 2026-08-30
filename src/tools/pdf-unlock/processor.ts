import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { PdfUnlockOptions } from './options';
import type { PdfUnlockWorkerInput, PdfUnlockWorkerResult } from './worker-types';

export async function processPdfUnlock(
  ctx: ProcessingContext<PdfUnlockOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.1);
  const buffer = await files[0]!.file.arrayBuffer();
  const base = files[0]!.name.replace(/\.pdf$/i, '');
  onProgress(0.3);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: PdfUnlockWorkerInput = {
    buffer,
    password: options.password,
  };

  const { bytes } = await runInWorker<PdfUnlockWorkerResult>({
    worker,
    input,
    transfer: [buffer],
    signal,
    onProgress: (p) => onProgress(0.3 + p * 0.7),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}-unlocked.pdf`, bytes: blob.size }],
  };
}
