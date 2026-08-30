import type { ProcessingContext, ProcessingResult } from '@/core/tool-types';
import { runInWorker } from '@/core/worker-runner';
import type { TxtToPdfOptions } from './options';
import type { TxtToPdfWorkerInput, TxtToPdfWorkerResult } from './worker-types';

export async function processTxtToPdf(
  ctx: ProcessingContext<TxtToPdfOptions>,
): Promise<ProcessingResult> {
  const { files, options, signal, onProgress } = ctx;

  onProgress(0.05);
  const text = await files[0]!.file.text();
  const base = files[0]!.name.replace(/\.(txt|log)$/i, '');
  onProgress(0.15);

  const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
  const input: TxtToPdfWorkerInput = {
    text,
    fontSize: options.fontSize,
  };

  const { bytes } = await runInWorker<TxtToPdfWorkerResult>({
    worker,
    input,
    signal,
    onProgress: (p) => onProgress(0.15 + p * 0.85),
  });

  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  return {
    outputs: [{ blob, filename: `${base}.pdf`, bytes: blob.size }],
  };
}
